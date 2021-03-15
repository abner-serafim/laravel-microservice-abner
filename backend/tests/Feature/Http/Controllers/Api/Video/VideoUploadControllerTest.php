<?php

namespace Tests\Feature\Http\Controllers\Api\Video;

use App\Http\Controllers\Api\VideoController;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Exceptions\TestException;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;
use Tests\TestCase;

class VideoUploadControllerTest extends VideoBaseControllerTest
{
    public function testInvalidationThumbField()
    {
        $this->assertInvalidationFile(
            'thumb_file',
            'jpg',
            Video::FILE_MAX_SIZE_THUMB,
            'validation.image'
        );
    }
    public function testInvalidationBannerField()
    {
        $this->assertInvalidationFile(
            'banner_file',
            'jpg',
            Video::FILE_MAX_SIZE_BANNER,
            'validation.image'
        );
    }
    public function testInvalidationTrailerField()
    {
        $this->assertInvalidationFile(
            'trailer_file',
            'mp4',
            Video::FILE_MAX_SIZE_TRAILER,
            'validation.mimetypes',
            ['values' => 'video/mp4']
        );
    }
    public function testInvalidationVideoField()
    {
        $this->assertInvalidationFile(
            'video_file',
            'mp4',
            Video::FILE_MAX_SIZE_VIDEO,
            'validation.mimetypes',
            ['values' => 'video/mp4']
        );
    }

    public function testStoreWithFiles()
    {
        Storage::fake();
        $files = $this->getFiles();

        /** @var Category $category */
        $category = Category::factory()->create();
        /** @var Genre $genre */
        $genre = Genre::factory()->create();
        $genre->categories()->sync([$category->id]);

        $cat_gen = [
            'categories_id' => [$category->id],
            'genres_id' => [$genre->id],
        ];

        $response = $this->json(
            'POST',
            $this->getRouteStore(),
            $this->sendData + $cat_gen + $files
        );

        //dd($response);

        $response->assertStatus(201);
        $this->assertExistsFiles($response->json('data.id'), $files);
    }

    public function testUpdateWithFiles()
    {
        Storage::fake();
        $files = $this->getFiles();

        /** @var Category $category */
        $category = Category::factory()->create();
        /** @var Genre $genre */
        $genre = Genre::factory()->create();
        $genre->categories()->sync([$category->id]);

        $cat_gen = [
            'categories_id' => [$category->id],
            'genres_id' => [$genre->id],
        ];

        $response = $this->json(
            'PUT',
            $this->getRouteUpdate(),
            $this->sendData + $cat_gen + $files
        );

        $response->assertStatus(200);
        $this->assertExistsFiles($response->json('data.id'), $files);

        $this->assertIfFilesUrlExists($this->video, $response);

        $newFiles = [
            'trailer_file' => UploadedFile::fake()->create('trailer_file.mp4'),
            'video_file' => UploadedFile::fake()->create('video_file.mp4'),
        ];

        $response = $this->json(
            'PUT',
            $this->getRouteUpdate(),
            $this->sendData + $cat_gen + $newFiles
        );

        $response->assertStatus(200);
        /** @var Video $video */
        $video = Video::find($response->json('data.id'));
        Storage::assertMissing($video->relativeFilePath($files['trailer_file']->hashName()));
        Storage::assertMissing($video->relativeFilePath($files['video_file']->hashName()));

        $this->assertIfFilesUrlExists($this->video, $response);
    }

    protected function assertExistsFiles($id, array $files)
    {
        /** @var Video $video */
        $video = Video::find($id);
        $this->assertExistsFilesLoop($video, $files);
    }

    protected function assertExistsFilesLoop(Video $video, array $files)
    {
        /** @var UploadedFile $file */
        foreach ($files AS $file) {
            Storage::assertExists($video->relativeFilePath($file->hashName()));
        }
    }
}
