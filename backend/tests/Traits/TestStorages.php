<?php


namespace Tests\Traits;


use Illuminate\Support\Facades\Storage;

trait TestStorages
{
    protected function deleteAllFiles($dirs)
    {
        if (!is_array($dirs)) $dirs = [$dirs];

        foreach ($dirs as $dir) {
            $files = Storage::files($dir);
            Storage::delete($files);
            Storage::deleteDirectory($dir);
        }
    }
}
