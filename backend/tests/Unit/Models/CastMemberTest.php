<?php

namespace Tests\Unit\Models;

use App\Models\CastMember;
use App\Models\Traids\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tests\TestCase;

class CastMemberTest extends TestCase
{
    private CastMember $castMember;

    protected function setUp(): void
    {
        parent::setUp();
        $this->castMember = new CastMember();
    }

    public function testFillableAttribute()
    {
        $fillable = ['name', 'type'];
        $this->assertEqualsCanonicalizing($fillable, $this->castMember->getFillable());
    }

    public function testIfUseTraitsAttribute()
    {
        $traits = [HasFactory::class, SoftDeletes::class, Uuid::class];
        $castMemberTraits = array_keys(class_uses(CastMember::class));
        $this->assertEqualsCanonicalizing($traits, $castMemberTraits);
    }

    public function testDatesAttribute()
    {
        $dates = ["deleted_at", "created_at", "updated_at"];
        $this->assertEqualsCanonicalizing($dates, $this->castMember->getDates());
    }

    public function testCastsAttribute()
    {
        $casts = ["id" => "string", "deleted_at" => "datetime", "type" => "integer"];
        $this->assertEquals($casts, $this->castMember->getCasts());
    }

    public function testIncrementingAttribute()
    {
        $this->assertFalse($this->castMember->getIncrementing());
    }
}
