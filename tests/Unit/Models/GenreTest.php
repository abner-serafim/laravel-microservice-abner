<?php

namespace Tests\Unit\Models;

use App\Models\Genre;
use App\Models\Traids\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tests\TestCase;

class GenreTest extends TestCase
{
    private Genre $genre;

    protected function setUp(): void
    {
        parent::setUp();
        $this->genre = new Genre();
    }

    public function testFillableAttribute()
    {
        $fillable = ['name', 'is_active'];
        $this->assertEqualsCanonicalizing($fillable, $this->genre->getFillable());
    }

    public function testIfUseTraitsAttribute()
    {
        $traits = [HasFactory::class, SoftDeletes::class, Uuid::class];
        $genreTraits = array_keys(class_uses(Genre::class));
        $this->assertEqualsCanonicalizing($traits, $genreTraits);
    }

    public function testDatesAttribute()
    {
        $dates = ["deleted_at", "created_at", "updated_at"];
        $this->assertEqualsCanonicalizing($dates, $this->genre->getDates());
    }

    public function testCastsAttribute()
    {
        $casts = ["id" => "string", "deleted_at" => "datetime", "is_active" => "boolean"];
        $this->assertEquals($casts, $this->genre->getCasts());
    }

    public function testIncrementingAttribute()
    {
        $this->assertFalse($this->genre->getIncrementing());
    }
}
