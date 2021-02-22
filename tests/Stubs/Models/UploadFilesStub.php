<?php

namespace Tests\Stubs\Models;

use App\Models\Traids\UploadFiles;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;

class UploadFilesStub extends Model
{
    use UploadFiles;

//    protected $table = 'category_stubs';
//    protected $fillable = ['name', 'description'];
    public static array $fileFields = ['file1', 'file2'];
//
//    public static function createTable()
//    {
//        \Schema::create('category_stubs', function (Blueprint $table) {
//            $table->id();
//            $table->string('name');
//            $table->text('description')->nullable();
//            $table->timestamps();
//        });
//    }
//
//    public static function dropTable()
//    {
//        \Schema::dropIfExists('category_stubs');
//    }

    protected function uploadDir()
    {
        return "stub";
    }

    public function getUploadDir()
    {
        return $this->uploadDir();
    }
}
