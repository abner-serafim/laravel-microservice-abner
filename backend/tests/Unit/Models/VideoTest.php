<?php

namespace Tests\Unit\Models;

use App\Models\Traids\UploadFiles;
use App\Models\Video;
use App\Models\Traids\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tests\TestCase;

class VideoTest extends TestCase
{
    private Video $video;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = new Video();
    }

    public function testFillableAttribute()
    {
        $fillable = ['title', 'description', 'duration', 'opened', 'rating', 'year_launched', 'video_file', 'trailer_file', 'banner_file', 'thumb_file'];
        $this->assertEqualsCanonicalizing($fillable, $this->video->getFillable());
    }

    public function testIfUseTraitsAttribute()
    {
        $traits = [HasFactory::class, SoftDeletes::class, Uuid::class, UploadFiles::class];
        $videoTraits = array_keys(class_uses(Video::class));
        $this->assertEqualsCanonicalizing($traits, $videoTraits);
    }

    public function testDatesAttribute()
    {
        $dates = ["deleted_at", "created_at", "updated_at"];
        $this->assertEqualsCanonicalizing($dates, $this->video->getDates());
    }

    public function testCastsAttribute()
    {
        $casts = ["id" => "string", "deleted_at" => "datetime", "opened" => "boolean", "year_launched" => "integer", "duration" => "integer"];
        $this->assertEquals($casts, $this->video->getCasts());
    }

    public function testIncrementingAttribute()
    {
        $this->assertFalse($this->video->getIncrementing());
    }
}
