<?php

namespace Tests\Feature\Models;

use App\Models\Category;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        Category::create(["name" => "Teste"]);
        $fields = [
            'id',
            'name',
            'description',
            'is_active',
            'created_at',
            'updated_at',
            'deleted_at',
        ];
        $categories = Category::all();
        $categoriesKey = array_keys($categories->first()->getAttributes());
        $this->assertEqualsCanonicalizing($fields, $categoriesKey);
    }

    public function testCreate()
    {
        $category = Category::create(["name" => "Teste"]);
        $category->refresh();

        $this->assertEquals("Teste", $category->name);
        $this->assertNull($category->description);
        $this->assertTrue($category->is_active);

        $category = Category::create(["name" => "Teste", "description" => null, "is_active" => false]);

        $this->assertNull($category->description);
        $this->assertFalse($category->is_active);

        $category = Category::create(["name" => "Teste", "description" => "Teste de Descrição", "is_active" => true]);

        $this->assertEquals("Teste de Descrição", $category->description);
        $this->assertTrue($category->is_active);
    }

    public function testUpdate()
    {
        $categoryAll = Category::factory(1)->create();
        $category = $categoryAll->first();

        $data = ["name" => "TesteUpdate", "description" => "TesteDescriptionUpdate", "is_active" => false];
        $category->update($data);

        foreach ($data AS $key => $value) {
            self::assertEquals($value, $category->{$key});
        }
    }

    public function testDelete()
    {
        $category = Category::factory()->create();
        $category->delete();
        self::assertNull(Category::find($category->id));

        $category->restore();
        self::assertNotNull(Category::find($category->id));
    }
}
