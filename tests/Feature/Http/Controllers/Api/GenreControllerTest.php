<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class GenreControllerTest extends TestCase
{
    use DatabaseMigrations;

    public function testIndex()
    {
        $genreAll = Genre::factory(1)->create();
        $response = $this->get(route('api.genres.index'));
        $response->assertStatus(200)->assertJson($genreAll->toArray());
    }

    public function testShow()
    {
        $genre = Genre::factory()->create();
        $response = $this->get(route('api.genres.show', $genre->id));
        $response->assertStatus(200)->assertJson($genre->toArray());
    }

    public function testInvalidationData()
    {
        $response = $this->json('POST', route('api.genres.store'), []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJsonMissingValidationErrors(['is_active'])
            ->assertJsonFragment([
                trans('validation.required', ['attribute' => 'name'])
            ])
        ;

        $response = $this->json('POST', route('api.genres.store'), [
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

        $genre = Genre::factory()->create();
        $response = $this->json('PUT', route('api.genres.update', $genre->id), [
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
        $response = $this->json('POST', route('api.genres.store'), [
            'name' => 'teste'
        ]);

        $id = $response->json('id');
        $genre = Genre::find($id);

        $response
            ->assertStatus(201)
            ->assertJson($genre->toArray());

        self::assertTrue($response->json('is_active'));

        $response = $this->json('POST', route('api.genres.store'), [
            'name' => 'teste',
            'is_active' => false
        ]);

        $id = $response->json('id');
        $genre = Genre::find($id);

        $response
            ->assertStatus(201)
            ->assertJson($genre->toArray());

        self::assertFalse($response->json('is_active'));
    }

    public function testUpdate()
    {
        $genre = Genre::factory()->create(['is_active' => false]);
        $response = $this->json('PUT', route('api.genres.update', $genre->id), [
            'name' => 'teste',
            'is_active' => true
        ]);

        $id = $response->json('id');
        $genre = Genre::find($id);

        $response
            ->assertStatus(200)
            ->assertJson($genre->toArray());

        self::assertTrue($response->json('is_active'));

        $genre = Genre::factory()->create();
        $response = $this->json('PUT', route('api.genres.update', $genre->id), [
            'name' => 'teste',
            'is_active' => false
        ]);

        $id = $response->json('id');
        $genre = Genre::find($id);

        $response
            ->assertStatus(200)
            ->assertJson($genre->toArray());

        self::assertFalse($response->json('is_active'));
    }

    public function testDelete()
    {
        $genre = Genre::factory()->create(['is_active' => false]);
        $response = $this->json('DELETE', route('api.genres.destroy', $genre->id));

        $response
            ->assertStatus(204);

        self::assertNull(Genre::find($genre->id));
        self::assertNotNull(Genre::withTrashed()->find($genre->id));
    }
}
