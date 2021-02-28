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
    public function testInvalidationVideoField()
    {
        $this->assertInvalidationFile(
            'video_file',
            'mp4',
            1024,
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

        $response->assertStatus(201);
        /** @var Video $video */
        $video = Video::find($response->json('id'));
        foreach ($files AS $file) {
            Storage::assertExists("{$video->getUploadDir()}/{$file->hashName()}");
        }
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
        /** @var Video $video */
        $video = Video::find($response->json('id'));
        foreach ($files AS $file) {
            Storage::assertExists("{$video->getUploadDir()}/{$file->hashName()}");
        }
    }
}
