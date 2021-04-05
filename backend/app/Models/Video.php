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

    const FILE_MAX_SIZE_THUMB = 1024 * 5; // 5MB
    const FILE_MAX_SIZE_BANNER = 1024 * 10; // 10MB
    const FILE_MAX_SIZE_TRAILER = 1024 * 1024 * 1; // 1GB
    const FILE_MAX_SIZE_VIDEO = 1024 * 1024 * 50; // 50GB

    protected $fillable = [
        'title',
        'description',
        'year_launched',
        'opened',
        'rating',
        'duration',
        'video_file',
        'trailer_file',
        'banner_file',
        'thumb_file',
    ];
    protected $dates = ['deleted_at'];
    protected $casts = [
        'id' => 'string',
        'opened' => 'boolean',
        'year_launched' => 'integer',
        'duration' => 'integer'
    ];

    public $incrementing = false;
    public static array $fileFields = ['video_file', 'trailer_file', 'banner_file', 'thumb_file'];

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
                $video->deleteFiles($files);
            }
            DB::rollBack();
            throw $e;
        }
    }

    public function update(array $attributes = [], array $options = [])
    {
        $files = self::extractFiles($attributes);
        try {
            DB::beginTransaction();
            $saved = parent::update($attributes, $options);
            if ($saved) {
                static::handleRelations($this, $attributes);
                $this->uploadFiles($files);
            }
            DB::commit();
            if ($saved && sizeof($files)) {
                $this->deleteOldFiles();
            }
            return $saved;
        } catch (\Exception $e) {
            $this->deleteFiles($files);
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
        if (isset($attributes['cast_members_id'])) {
            $video->castMembers()->sync($attributes['cast_members_id']);
        }
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class)->withTrashed();
    }

    public function genres()
    {
        return $this->belongsToMany(Genre::class)->withTrashed();
    }

    public function castMembers()
    {
        return $this->belongsToMany(CastMember::class)->withTrashed();
    }

    protected function uploadDir()
    {
        $created_at = substr($this->created_at, 0, 7);
        return str_replace("-", "/", $created_at) . "/" . $this->id;
    }

    public function relativeFilePath($value)
    {
        if (!$value) return null;
        return "{$this->uploadDir()}/{$value}";
    }

    public function getThumbFileUrlAttribute()
    {
        return $this->thumb_file ? $this->getFileUrl($this->thumb_file) : null;
    }

    public function getBannerFileUrlAttribute()
    {
        return $this->banner_file ? $this->getFileUrl($this->banner_file) : null;
    }

    public function getTrailerFileUrlAttribute()
    {
        return $this->trailer_file ? $this->getFileUrl($this->trailer_file) : null;
    }

    public function getVideoFileUrlAttribute()
    {
        return $this->video_file ? $this->getFileUrl($this->video_file) : null;
    }
}
