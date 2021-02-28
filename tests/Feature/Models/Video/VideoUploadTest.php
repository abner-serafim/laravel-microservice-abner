<?php

namespace Tests\Feature\Models\Video;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\Events\TransactionCommitted;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Ramsey\Uuid\Uuid;
use Tests\Exceptions\TestException;
use Tests\TestCase;

class VideoUploadTest extends VideoBaseTest
{
    public function testCreateWithFiles()
    {
        Storage::fake();
        $video = Video::create(
            $this->sendData + [
                'thumb_file' => UploadedFile::fake()->image('thumb.jpg'),
                'video_file' => UploadedFile::fake()->image('video.jpg'),
            ]
        );
        Storage::assertExists("{$video->getUploadDir()}/{$video->thumb_file}");
        Storage::assertExists("{$video->getUploadDir()}/{$video->video_file}");
    }

    public function testUpdateWithFiles()
    {
        Storage::fake();
        $thumbFile = UploadedFile::fake()->image('thumb.jpg');
        $videoFile = UploadedFile::fake()->image('video.jpg');
        $video = Video::factory()->create();
        $video->update($this->sendData + [
                'thumb_file' => $thumbFile,
                'video_file' => $videoFile,
            ]
        );
        Storage::assertExists("{$video->getUploadDir()}/{$video->thumb_file}");
        Storage::assertExists("{$video->getUploadDir()}/{$video->video_file}");

        $videoFileNew = UploadedFile::fake()->image('video.jpg');
        $video->update($this->sendData + [
                'video_file' => $videoFileNew,
            ]
        );
        Storage::assertExists("{$video->getUploadDir()}/{$thumbFile->hashName()}");
        Storage::assertMissing("{$video->getUploadDir()}/{$videoFile->hashName()}");
        Storage::assertExists("{$video->getUploadDir()}/{$videoFileNew->hashName()}");
    }

    public function testCreateIfRollbackFiles()
    {
        Storage::fake();
        Event::listen(TransactionCommitted::class, function() {
            throw new TestException();
        });
        $hasError = false;

        try {
            Video::create(
                $this->sendData + [
                    'thumb_file' => UploadedFile::fake()->image('thumb.jpg'),
                    'video_file' => UploadedFile::fake()->image('video.jpg'),
                ]
            );
        } catch (TestException $e) {
            self::assertCount(0, Storage::allFiles());
            $hasError = true;
        }

        self::assertTrue($hasError);
    }

    public function testUpdateIfRollbackFiles()
    {
        Storage::fake();
        $video = Video::factory()->create();
        Event::listen(TransactionCommitted::class, function() {
            throw new TestException();
        });
        $hasError = false;

        try {
            $video->update(
                $this->sendData + [
                    'thumb_file' => UploadedFile::fake()->image('thumb.jpg'),
                    'video_file' => UploadedFile::fake()->image('video.jpg'),
                ]
            );
        } catch (TestException $e) {
            self::assertCount(0, Storage::allFiles());
            $hasError = true;
        }

        self::assertTrue($hasError);
    }
}
