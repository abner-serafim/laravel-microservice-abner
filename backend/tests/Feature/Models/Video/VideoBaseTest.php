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

abstract class VideoBaseTest extends TestCase
{
    use DatabaseMigrations;

    protected array $sendData;
    protected array $fileFields;

    protected function setUp(): void
    {
        parent::setUp(); // TODO: Change the autogenerated stub
        $this->sendData = [
            'title' => 'title',
            'description' => 'description',
            'year_launched' => 2010,
            'opened' => true,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90,
        ];
        $this->fileFields = [];
        foreach (Video::$fileFields as $field) {
            $this->fileFields[$field] = "$field.test";
        }
    }

    protected function assertHasCategory($categoryId, $videoId)
    {
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoryId,
            'video_id' => $videoId,
        ]);
    }

    protected function assertMissingCategory($categoryId, $videoId)
    {
        $this->assertDatabaseMissing('category_video', [
            'category_id' => $categoryId,
            'video_id' => $videoId,
        ]);
    }

    protected function assertHasGenre($genreId, $videoId)
    {
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genreId,
            'video_id' => $videoId,
        ]);
    }

    protected function assertMissingGenre($genreId, $videoId)
    {
        $this->assertDatabaseMissing('genre_video', [
            'genre_id' => $genreId,
            'video_id' => $videoId,
        ]);
    }
}