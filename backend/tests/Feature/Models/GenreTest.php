<?php

namespace Tests\Feature\Models;

use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Ramsey\Uuid\Uuid;
use Tests\TestCase;

class GenreTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        Genre::create(["name" => "Teste"]);
        $fields = [
            'id',
            'name',
            'is_active',
            'created_at',
            'updated_at',
            'deleted_at',
        ];
        $genres = Genre::all();
        $genresKey = array_keys($genres->first()->getAttributes());
        $this->assertEqualsCanonicalizing($fields, $genresKey);
    }

    public function testCreate()
    {
        $genre = Genre::create(["name" => "Teste"]);
        $genre->refresh();

        $this->assertTrue(Uuid::isValid($genre->id));
        $this->assertEquals("Teste", $genre->name);
        $this->assertTrue($genre->is_active);

        $genre = Genre::create(["name" => "Teste", "is_active" => false]);

        $this->assertNull($genre->description);
        $this->assertFalse($genre->is_active);

        $genre = Genre::create(["name" => "Teste", "is_active" => true]);

        $this->assertTrue($genre->is_active);
    }

    public function testUpdate()
    {
        $genreAll = Genre::factory(1)->create();
        $genre = $genreAll->first();

        $data = ["name" => "TesteUpdate", "is_active" => false];
        $genre->update($data);

        foreach ($data AS $key => $value) {
            self::assertEquals($value, $genre->{$key});
        }
    }

    public function testDelete()
    {
        $genre = Genre::factory()->create();
        $genre->delete();
        self::assertNull(Genre::find($genre->id));

        $genre->restore();
        self::assertNotNull(Genre::find($genre->id));
    }
}
