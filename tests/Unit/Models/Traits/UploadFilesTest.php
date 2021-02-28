<?php

namespace Tests\Unit\Models\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Stubs\Models\UploadFilesStub;
use Tests\TestCase;

class UploadFilesTest extends TestCase
{
    private UploadFilesStub $uploadFilesStub;

    protected function setUp(): void
    {
        parent::setUp();
        $this->uploadFilesStub = new UploadFilesStub();
    }

    public function testUploadFile()
    {
        //Storage::fake();
        $file = UploadedFile::fake()->create('video.mp4');
        $this->uploadFilesStub->uploadFile($file);
        Storage::assertExists($this->uploadFilesStub->getUploadDir() . "/" . $file->hashName());
    }

    public function testUploadFiles()
    {
        Storage::fake();
        $file1 = UploadedFile::fake()->create('video1.mp4');
        $file2 = UploadedFile::fake()->create('video2.mp4');
        $files = [$file1, $file2];
        $this->uploadFilesStub->uploadFiles($files);
        foreach ($files as $file) {
            Storage::assertExists($this->uploadFilesStub->getUploadDir() . "/" . $file->hashName());
        }
    }

    public function testDeleteOldFiles()
    {
        Storage::fake();
        $file1 = UploadedFile::fake()->create('video1.mp4')->size(1);
        $file2 = UploadedFile::fake()->create('video2.mp4')->size(1);
        $files = [$file1, $file2];
        $this->uploadFilesStub->uploadFiles($files);
        $this->uploadFilesStub->deleteOldFiles();
        self::assertCount(2, Storage::allFiles());

        $this->uploadFilesStub->oldFiles = [$file1->hashName()];
        $this->uploadFilesStub->deleteOldFiles();
        Storage::assertMissing($this->uploadFilesStub->getUploadDir() . "/" . $file1->hashName());
        Storage::assertExists($this->uploadFilesStub->getUploadDir() . "/" . $file2->hashName());
    }

    public function testDeleteFile()
    {
        Storage::fake();
        $file = UploadedFile::fake()->create('video.mp4');
        $this->uploadFilesStub->uploadFile($file);
        $filename = $this->uploadFilesStub->getUploadDir() . "/" . $file->hashName();
        Storage::assertExists($filename);
        $this->uploadFilesStub->deleteFile($file);
        Storage::assertMissing($filename);

        $file = UploadedFile::fake()->create('video.mp4');
        $this->uploadFilesStub->uploadFile($file);
        $filename = $this->uploadFilesStub->getUploadDir() . "/" . $file->hashName();
        Storage::assertExists($filename);
        $this->uploadFilesStub->deleteFile($file->hashName());
        Storage::assertMissing($filename);
    }

    public function testDeleteFiles()
    {
        Storage::fake();
        $file1 = UploadedFile::fake()->create('video1.mp4');
        $file2 = UploadedFile::fake()->create('video2.mp4');
        $files = [$file1, $file2];
        $this->uploadFilesStub->uploadFiles($files);
        foreach ($files as $file) {
            $filename = $this->uploadFilesStub->getUploadDir() . "/" . $file->hashName();
            Storage::assertExists($filename);
        }

        $this->uploadFilesStub->deleteFiles([$file1, $file2->hashName()]);

        foreach ($files as $file) {
            $filename = $this->uploadFilesStub->getUploadDir() . "/" . $file->hashName();
            Storage::assertMissing($filename);
        }
    }

    public function testExtractFiles()
    {
        Storage::fake();

        $attributes = [];
        $files = UploadFilesStub::extractFiles($attributes);
        self::assertCount(0, $attributes);
        self::assertCount(0, $files);

        $attributes = ['file1' => 'test'];
        $files = UploadFilesStub::extractFiles($attributes);
        self::assertCount(1, $attributes);
        self::assertCount(0, $files);

        $file1 = UploadedFile::fake()->create('video1.mp4');
        $attributes = ['file1' => $file1, 'title' => 'title'];
        $files = UploadFilesStub::extractFiles($attributes);
        self::assertCount(2, $attributes);
        self::assertCount(1, $files);
        self::assertEquals(['file1' => $file1->hashName(), 'title' => 'title'], $attributes);

        $file2 = UploadedFile::fake()->create('video1.mp4');
        $attributes = ['file1' => 'name.mp4', 'file2' => $file2, 'title' => 'title'];
        $files = UploadFilesStub::extractFiles($attributes);
        self::assertCount(3, $attributes);
        self::assertCount(1, $files);
        self::assertEquals(['file1' => 'name.mp4', 'file2' => $file2->hashName(), 'title' => 'title'], $attributes);
        self::assertEquals([$file2], $files);
    }
}
