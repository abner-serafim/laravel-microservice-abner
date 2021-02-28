<?php

namespace Tests\Stubs\Models;

use App\Models\Traids\UploadFiles;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;

class UploadFilesStub extends Model
{
    use UploadFiles;

    protected $table = 'upload_file_stubs';
    protected $fillable = ['name', 'file1', 'file2'];
    public static array $fileFields = ['file1', 'file2'];

    public static function createTable()
    {
        \Schema::create('upload_file_stubs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('file1')->nullable();
            $table->string('file2')->nullable();
            $table->timestamps();
        });
    }

    public static function dropTable()
    {
        \Schema::dropIfExists('upload_file_stubs');
    }

    protected function uploadDir()
    {
        return "stub";
    }

    public function getUploadDir()
    {
        return $this->uploadDir();
    }
}
