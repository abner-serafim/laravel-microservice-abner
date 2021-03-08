<?php

namespace Tests\Feature\Models\Video;

use App\Models\Video;
use Illuminate\Database\Events\TransactionCommitted;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Tests\Exceptions\TestException;

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
        Storage::assertExists($video->relativeFilePath($video->thumb_file));
        Storage::assertExists($video->relativeFilePath($video->video_file));
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
        Storage::assertExists($video->relativeFilePath($video->thumb_file));
        Storage::assertExists($video->relativeFilePath($video->video_file));

        $videoFileNew = UploadedFile::fake()->image('video.jpg');
        $video->update($this->sendData + [
                'video_file' => $videoFileNew,
            ]
        );
        Storage::assertExists($video->relativeFilePath($thumbFile->hashName()));
        Storage::assertMissing($video->relativeFilePath($videoFile->hashName()));
        Storage::assertExists($video->relativeFilePath($videoFileNew->hashName()));
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

    public function testFileUrlWithLocalDriver()
    {
        $fileFields = [];
        foreach (Video::$fileFields as $field) {
            $fileFields[$field] = "$field.test";
        }
        /** @var Video $video */
        $video = Video::factory()->create($fileFields);
        $localDriver = config('filesystems.default');
        $baseUrl = config('filesystems.disks.' . $localDriver)['url'];
        foreach ($fileFields as $field => $value) {
            $fileUrl = $video->{"{$field}_url"};
            self::assertEquals("{$baseUrl}/" . $video->relativeFilePath($value), $fileUrl);
        }
    }

    public function testFileUrlWithGcsDriver()
    {
        $fileFields = [];
        foreach (Video::$fileFields as $field) {
            $fileFields[$field] = "$field.test";
        }
        /** @var Video $video */
        $video = Video::factory()->create($fileFields);
        $baseUrl = config('filesystems.disks.gcs.storage_api_uri');
        Config::set('filesystems.default', 'gcs');
        foreach ($fileFields as $field => $value) {
            $fileUrl = $video->{"{$field}_url"};
            self::assertEquals("{$baseUrl}/" . $video->relativeFilePath($value), $fileUrl);
        }
    }
}
