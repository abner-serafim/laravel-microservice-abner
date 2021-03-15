<?php

namespace Tests\Feature\Models\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Stubs\Models\UploadFilesStub;
use Tests\TestCase;

class UploadFilesTest extends TestCase
{
    private UploadFilesStub $uploadFilesStub;

    protected function tearDown(): void
    {
        UploadFilesStub::dropTable();
        parent::tearDown();
    }

    protected function setUp(): void
    {
        parent::setUp();
        UploadFilesStub::dropTable();
        UploadFilesStub::createTable();
        $this->uploadFilesStub = new UploadFilesStub();
    }

    public function testMakeOldFilesOnSaving()
    {
        $this->uploadFilesStub->fill([
            'name' => 'test',
            'file1' => 'test1.mp4',
            'file2' => 'test2.mp4',
        ]);
        $this->uploadFilesStub->save();
        self::assertCount(0, $this->uploadFilesStub->oldFiles);

        $this->uploadFilesStub->update([
            'name' => 'test',
            'file2' => 'test3.mp4',
        ]);
        self::assertEqualsCanonicalizing(['test2.mp4'], $this->uploadFilesStub->oldFiles);
    }

    public function testMakeOldFilesNullOrSaving()
    {
        $this->uploadFilesStub->fill([
            'name' => 'test',
        ]);
        $this->uploadFilesStub->save();
        self::assertCount(0, $this->uploadFilesStub->oldFiles);

        $this->uploadFilesStub->update([
            'name' => 'test',
            'file2' => 'test3.mp4',
        ]);
        self::assertCount(0, $this->uploadFilesStub->oldFiles);
    }
}
