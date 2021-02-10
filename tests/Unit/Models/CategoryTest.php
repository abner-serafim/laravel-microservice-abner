<?php

namespace Tests\Unit\Models;

use App\Models\Category;
use App\Models\Traids\Uuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->category = new Category();
    }

    public function testFillableAttribute()
    {
        $fillable = ['name', 'description', 'is_active'];
        $this->assertEqualsCanonicalizing($fillable, $this->category->getFillable());
    }

    public function testIfUseTraitsAttribute()
    {
        $traits = [HasFactory::class, SoftDeletes::class, Uuid::class];
        $categoryTraits = array_keys(class_uses(Category::class));
        $this->assertEqualsCanonicalizing($traits, $categoryTraits);
    }

    public function testDatesAttribute()
    {
        $dates = ["deleted_at", "created_at", "updated_at"];
        $this->assertEqualsCanonicalizing($dates, $this->category->getDates());
    }

    public function testCastsAttribute()
    {
        $casts = ["id" => "string", "deleted_at" => "datetime", "is_active" => "boolean"];
        $this->assertEquals($casts, $this->category->getCasts());
    }

    public function testIncrementingAttribute()
    {
        $this->assertFalse($this->category->getIncrementing());
    }
}
