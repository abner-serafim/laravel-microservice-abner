<?php

namespace Tests\Prod\Models\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;
use Tests\Stubs\Models\UploadFilesStub;
use Tests\TestCase;
use Tests\Traits\TestProd;
use Tests\Traits\TestStorages;

class UploadFilesTest extends TestCase
{
    use TestStorages, TestProd;

    private UploadFilesStub $uploadFilesStub;

    protected function tearDown(): void
    {
        if ($this->isTestingProd()) $this->deleteAllFiles($this->uploadFilesStub->relativeFilePath(""));
        parent::tearDown();
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->uploadFilesStub = new UploadFilesStub();
        Config::set('filesystems.default', 'gcs');
        $this->skipTestIfProd();
    }

    public function testUploadFile()
    {
        $file = UploadedFile::fake()->create('video.mp4');
        $this->uploadFilesStub->uploadFile($file);
        Storage::assertExists($this->uploadFilesStub->relativeFilePath($file->hashName()));
    }

    public function testUploadFiles()
    {
        $file1 = UploadedFile::fake()->create('video1.mp4');
        $file2 = UploadedFile::fake()->create('video2.mp4');
        $files = [$file1, $file2];
        $this->uploadFilesStub->uploadFiles($files);
        foreach ($files as $file) {
            Storage::assertExists($this->uploadFilesStub->relativeFilePath($file->hashName()));
        }
    }

    public function testDeleteOldFiles()
    {
        $file1 = UploadedFile::fake()->create('video1.mp4')->size(1);
        $file2 = UploadedFile::fake()->create('video2.mp4')->size(1);
        $files = [$file1, $file2];
        $this->uploadFilesStub->uploadFiles($files);
        $this->uploadFilesStub->deleteOldFiles();
        self::assertCount(2, Storage::allFiles());

        $this->uploadFilesStub->oldFiles = [$file1->hashName()];
        $this->uploadFilesStub->deleteOldFiles();
        Storage::assertMissing($this->uploadFilesStub->relativeFilePath($file1->hashName()));
        Storage::assertExists($this->uploadFilesStub->relativeFilePath($file2->hashName()));
    }

    public function testDeleteFile()
    {
        $file = UploadedFile::fake()->create('video.mp4');
        $this->uploadFilesStub->uploadFile($file);
        $filename = $this->uploadFilesStub->relativeFilePath($file->hashName());
        Storage::assertExists($filename);
        $this->uploadFilesStub->deleteFile($file);
        Storage::assertMissing($filename);

        $file = UploadedFile::fake()->create('video.mp4');
        $this->uploadFilesStub->uploadFile($file);
        $filename = $this->uploadFilesStub->relativeFilePath($file->hashName());
        Storage::assertExists($filename);
        $this->uploadFilesStub->deleteFile($file->hashName());
        Storage::assertMissing($filename);
    }

    public function testDeleteFiles()
    {
        $file1 = UploadedFile::fake()->create('video1.mp4');
        $file2 = UploadedFile::fake()->create('video2.mp4');
        $files = [$file1, $file2];
        $this->uploadFilesStub->uploadFiles($files);
        foreach ($files as $file) {
            $filename = $this->uploadFilesStub->relativeFilePath($file->hashName());
            Storage::assertExists($filename);
        }

        $this->uploadFilesStub->deleteFiles([$file1, $file2->hashName()]);

        foreach ($files as $file) {
            $filename = $this->uploadFilesStub->relativeFilePath($file->hashName());
            Storage::assertMissing($filename);
        }
    }

    /*public function testExtractFiles()
    {
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
    }*/
}
