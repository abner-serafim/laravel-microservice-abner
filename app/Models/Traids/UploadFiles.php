<?php


namespace App\Models\Traids;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

trait UploadFiles
{
    public $oldFiles = [];
    protected abstract function uploadDir();
    public abstract function relativeFilePath(string $filename);
    // public static array $fileFields = [];

    public static function bootUploadFiles()
    {
        static::updating(function(Model $model) {
            $fieldsUpdated = array_keys($model->getDirty());
            $filesUpdated = array_intersect($fieldsUpdated, self::$fileFields);
            $filesFiltered = Arr::where($filesUpdated, function ($fileField) use ($model) {
                return $model->getOriginal($fileField);
            });
            $model->oldFiles = array_map(function ($fileField) use ($model) {
                return $model->getOriginal($fileField);
            }, $filesFiltered);
        });
    }

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

    public function deleteOldFiles()
    {
        $this->deleteFiles($this->oldFiles);
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
        $link = $this->relativeFilePath($filename);
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

    protected function getFileUrl($filename)
    {
        return Storage::url($this->relativeFilePath($filename));
    }
}
