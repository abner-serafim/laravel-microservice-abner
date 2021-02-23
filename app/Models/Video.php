<?php

namespace App\Models;

use App\Models\Traids\UploadFiles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Video extends Model
{
    use HasFactory, SoftDeletes, Traids\Uuid, UploadFiles;

    const RATING_LIVRE = 'L';
    const RATING_10 = '10';
    const RATING_12 = '12';
    const RATING_14 = '14';
    const RATING_16 = '16';
    const RATING_18 = '18';

    const RATING_LIST = [
        self::RATING_LIVRE,
        self::RATING_10,
        self::RATING_12,
        self::RATING_14,
        self::RATING_16,
        self::RATING_18,
    ];

    protected $fillable = ['title', 'description', 'year_launched', 'opened', 'rating', 'duration', 'video_file'];
    protected $dates = ['deleted_at'];
    protected $casts = [
        'id' => 'string',
        'opened' => 'boolean',
        'year_launched' => 'integer',
        'duration' => 'integer'
    ];

    public $incrementing = false;
    public static array $fileFields = ['video_file'];

    public static function create(array $attributes = [])
    {
        $files = self::extractFiles($attributes);
        try {
            DB::beginTransaction();
            /** @var Video $video */
            $video = static::query()->create($attributes);
            static::handleRelations($video, $attributes);
            $video->uploadFiles($files);
            DB::commit();
            return $video;
        } catch (\Exception $e) {
            if (isset($video)) {
                // TODO: excluir $obj
            }
            DB::rollBack();
            throw $e;
        }
    }

    public function update(array $attributes = [], array $options = [])
    {
        try {
            DB::beginTransaction();
            $saved = parent::update($attributes, $options);
            if ($saved) {
                // TODO: upload files
                // TODO: remove olds
                static::handleRelations($this, $attributes);
            }
            DB::commit();
            return $saved;
        } catch (\Exception $e) {
            // TODO: excluir uploads
            DB::rollBack();
            $this->refresh();
            throw $e;
        }
    }

    public static function handleRelations(Video $video, array $attributes): void
    {
        if (isset($attributes['categories_id'])) {
            $video->categories()->sync($attributes['categories_id']);
        }
        if (isset($attributes['genres_id'])) {
            $video->genres()->sync($attributes['genres_id']);
        }
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    public function genres()
    {
        return $this->belongsToMany(Genre::class);
    }

    protected function uploadDir()
    {
        $created_at = substr($this->created_at, 0, 7);
        return str_replace("-", "/", $created_at) . "/" . $this->id;
    }

    public function getUploadDir()
    {
        return $this->uploadDir();
    }
}
