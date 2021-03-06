<?php

namespace Tests\Feature\Models\Video;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Ramsey\Uuid\Uuid;
use Tests\Exceptions\TestException;
use Tests\TestCase;

class VideoCrudTest extends VideoBaseTest
{
    public function testList()
    {
        Video::create($this->sendData);
        $fields = [
            'id',
            'title',
            'description',
            'year_launched',
            'opened',
            'rating',
            'duration',
            'video_file',
            'trailer_file',
            'banner_file',
            'thumb_file',
            'created_at',
            'updated_at',
            'deleted_at',
        ];
        $videos = Video::all();
        self::assertCount(1, $videos);
        $videosKey = array_keys($videos->first()->getAttributes());
        $this->assertEqualsCanonicalizing($fields, $videosKey);
    }

    public function testCreate()
    {
        $data = $this->sendData + $this->fileFields;
        $video = Video::create($data);
        $video->refresh();

        $this->assertTrue(Uuid::isValid($video->id));
        foreach ($data AS $key => $value) {
            self::assertEquals($value, $video->{$key});
        }
        $this->assertNotNull($video->description);
        $this->assertTrue($video->opened);
        $this->assertDatabaseHas('videos', $data);

        unset($data['opened']);
        $video = Video::create($data + ['opened' => false]);
        $this->assertFalse($video->opened);
        $this->assertDatabaseHas('videos', ['opened' => false]);
    }

    public function testCreateWithRelations()
    {
        $category = Category::factory()->create();
        $genre = Genre::factory()->create();
        $video = Video::create($this->sendData + [
                'categories_id' => [$category->id],
                'genres_id' => [$genre->id],
            ]
        );

        $this->assertHasCategory($category->id, $video->id);
        $this->assertHasGenre($genre->id, $video->id);
    }

    public function testRollbackStore()
    {
        $hasError = false;

        try {
            Video::create([
                'title' => 'title',
                'description' => 'description',
                'year_launched' => 2010,
                'rating' => Video::RATING_LIST[0],
                'duration' => 90,
                'categories_id' => [0, 1, 2]
            ]);
        } catch (QueryException $exception) {
            self::assertCount(0, Video::all());
            $hasError = true;
        }

        self::assertTrue($hasError);
    }

    public function testRollbackUpdate()
    {
        $hasError = false;
        $video = Video::factory()->create();
        $oldTitle = $video->title;
        try {
            $video->update([
                'title' => 'title',
                'description' => 'description',
                'year_launched' => 2010,
                'rating' => Video::RATING_LIST[0],
                'duration' => 90,
                'categories_id' => [0, 1, 2]
            ]);
        } catch (QueryException $exception) {
            $this->assertDatabaseHas('videos', [
                'title' => $oldTitle
            ]);
            self::assertEquals($oldTitle, $video->title);
            $hasError = true;
        }

        self::assertTrue($hasError);
    }

    public function testUpdate()
    {
        $videoAll = Video::factory(1)->create();
        $video = $videoAll->first();

        $data = $this->sendData + $this->fileFields;
        $video->update($data);

        foreach ($this->sendData AS $key => $value) {
            self::assertEquals($value, $video->{$key});
        }
        $this->assertNotNull($video->description);
        $this->assertTrue($video->opened);
        $this->assertDatabaseHas('videos', $data);

        unset($data['opened']);
        $video->update($data + ['opened' => false]);
        $this->assertFalse($video->opened);
        $this->assertDatabaseHas('videos', ['opened' => false]);
    }

    public function testUpdateWithRelations()
    {
        $video = Video::factory()->create();
        $category = Category::factory()->create();
        $genre = Genre::factory()->create();

        $this->assertMissingCategory($category->id, $video->id);
        $this->assertMissingGenre($genre->id, $video->id);

        $video->update($this->sendData + [
                'categories_id' => [$category->id],
                'genres_id' => [$genre->id],
            ]
        );

        $this->assertHasCategory($category->id, $video->id);
        $this->assertHasGenre($genre->id, $video->id);
    }

    public function testSyncCategories()
    {
        $categoriesId = Category::factory(3)->create()->pluck('id')->toArray();
        $video = Video::factory()->create();

        Video::handleRelations($video, [
            'categories_id' => [$categoriesId[0]]
        ]);

        $this->assertHasCategory($categoriesId[0], $video->id);

        Video::handleRelations($video, [
            'categories_id' => [$categoriesId[1], $categoriesId[2]]
        ]);
        $this->assertMissingCategory($categoriesId[0], $video->id);
        $this->assertHasCategory($categoriesId[1], $video->id);
        $this->assertHasCategory($categoriesId[2], $video->id);
    }

    public function testSyncGenres()
    {
        $genresId = Genre::factory(3)->create()->pluck('id')->toArray();
        $video = Video::factory()->create();

        Video::handleRelations($video, [
            'genres_id' => [$genresId[0]]
        ]);

        $this->assertHasGenre($genresId[0], $video->id);

        Video::handleRelations($video, [
            'genres_id' => [$genresId[1], $genresId[2]]
        ]);
        $this->assertMissingGenre($genresId[0], $video->id);
        $this->assertHasGenre($genresId[1], $video->id);
        $this->assertHasGenre($genresId[2], $video->id);
    }

    public function testDelete()
    {
        $video = Video::factory()->create();
        $video->delete();
        self::assertNull(Video::find($video->id));

        $video->restore();
        self::assertNotNull(Video::find($video->id));
    }
}
