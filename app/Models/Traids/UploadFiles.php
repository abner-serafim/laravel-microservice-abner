<?php


namespace App\Models\Traids;


use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait UploadFiles
{
    protected abstract function uploadDir();
    // public static array $fileFields = [];

    /**
     * @param UploadedFile[] $files
     */
    public function uploadFiles(array $files)
    {
        foreach ($files as $file) {
            $this->uploadFile($file);
        }
    }

    public function uploadFile(UploadedFile $file)
    {
        $file->store($this->uploadDir());
    }

    public function deleteFiles(array $files)
    {
        foreach ($files as $file) {
            $this->deleteFile($file);
        }
    }

    /**
     * @param string|UploadedFile $file
     */
    public function deleteFile($file)
    {
        $filename = ($file instanceof UploadedFile) ? $file->hashName() : $file;
        $link = $this->getUploadDir() . "/" . $filename;
        if (Storage::exists($link)) Storage::delete($link);
    }

    public static function extractFiles(array &$attributes = [])
    {
        $files = [];

        if (property_exists(new static, 'fileFields')) {
            foreach (self::$fileFields as $file) {
                if (isset($attributes[$file]) && $attributes[$file] instanceof UploadedFile) {
                    $files[] = $attributes[$file];
                    $attributes[$file] = $attributes[$file]->hashName();
                }
            }
        }

        return $files;
    }
}
