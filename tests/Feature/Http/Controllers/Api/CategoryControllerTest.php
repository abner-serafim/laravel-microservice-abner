<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\Category;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
{
    use DatabaseMigrations;

    public function testIndex()
    {
        $categoryAll = Category::factory(1)->create();
        $response = $this->get(route('api.categories.index'));
        $response->assertStatus(200)->assertJson($categoryAll->toArray());
    }

    public function testShow()
    {
        $category = Category::factory()->create();
        $response = $this->get(route('api.categories.show', $category->id));
        $response->assertStatus(200)->assertJson($category->toArray());
    }

    public function testInvalidationData()
    {
        $response = $this->json('POST', route('api.categories.store'), []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJsonMissingValidationErrors(['is_active'])
            ->assertJsonFragment([
                trans('validation.required', ['attribute' => 'name'])
            ])
        ;

        $response = $this->json('POST', route('api.categories.store'), [
            'name' => str_repeat('a', 256),
            'is_active' => 'a'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'is_active'])
            ->assertJsonFragment([
                trans('validation.max.string', ['attribute' => 'name', 'max' => 255]),
            ])
            ->assertJsonFragment([
                trans('validation.boolean', ['attribute' => 'is active']),
            ])
        ;

        $category = Category::factory()->create();
        $response = $this->json('PUT', route('api.categories.update', $category->id), [
            'name' => str_repeat('a', 256),
            'is_active' => 'a'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'is_active'])
            ->assertJsonFragment([
                trans('validation.max.string', ['attribute' => 'name', 'max' => 255]),
            ])
            ->assertJsonFragment([
                trans('validation.boolean', ['attribute' => 'is active']),
            ])
        ;
    }

    public function testStore()
    {
        $response = $this->json('POST', route('api.categories.store'), [
            'name' => 'teste'
        ]);

        $id = $response->json('id');
        $category = Category::find($id);

        $response
            ->assertStatus(201)
            ->assertJson($category->toArray());

        self::assertTrue($response->json('is_active'));
        self::assertNull($response->json('description'));

        $response = $this->json('POST', route('api.categories.store'), [
            'name' => 'teste',
            'description' => 'description_test',
            'is_active' => false
        ]);

        $id = $response->json('id');
        $category = Category::find($id);

        $response
            ->assertStatus(201)
            ->assertJson($category->toArray());

        self::assertFalse($response->json('is_active'));
        self::assertNotNull($response->json('description'));
    }

    public function testUpdate()
    {
        $category = Category::factory()->create(['is_active' => false]);
        $response = $this->json('PUT', route('api.categories.update', $category->id), [
            'name' => 'teste',
            'description' => null,
            'is_active' => true
        ]);

        $id = $response->json('id');
        $category = Category::find($id);

        $response
            ->assertStatus(200)
            ->assertJson($category->toArray());

        self::assertTrue($response->json('is_active'));
        self::assertNull($response->json('description'));

        $category = Category::factory()->create();
        $response = $this->json('PUT', route('api.categories.update', $category->id), [
            'name' => 'teste',
            'description' => 'description_test',
            'is_active' => false
        ]);

        $id = $response->json('id');
        $category = Category::find($id);

        $response
            ->assertStatus(200)
            ->assertJson($category->toArray());

        self::assertFalse($response->json('is_active'));
        self::assertNotNull($response->json('description'));
    }

    public function testDelete()
    {
        $category = Category::factory()->create(['is_active' => false]);
        $response = $this->json('DELETE', route('api.categories.destroy', $category->id));

        $response
            ->assertStatus(204);
    }
}
