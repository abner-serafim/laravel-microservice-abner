<?php

namespace Tests\Feature\Models;

use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Ramsey\Uuid\Uuid;
use Tests\TestCase;

class CastMemberTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        CastMember::create(["name" => "Teste"]);
        $fields = [
            'id',
            'name',
            'type',
            'created_at',
            'updated_at',
            'deleted_at',
        ];
        $categories = CastMember::all();
        $categoriesKey = array_keys($categories->first()->getAttributes());
        $this->assertEqualsCanonicalizing($fields, $categoriesKey);
    }

    public function testCreate()
    {
        $cast_member = CastMember::create(["name" => "Teste"]);
        $cast_member->refresh();

        $this->assertTrue(Uuid::isValid($cast_member->id));
        $this->assertEquals("Teste", $cast_member->name);
        $this->assertIsInt($cast_member->type);
        $this->assertEquals($cast_member->type, CastMember::TYPE_DIRECTOR);

        $cast_member = CastMember::create(["name" => "Teste", "type" => CastMember::TYPE_ACTOR]);

        $this->assertEquals($cast_member->type, CastMember::TYPE_ACTOR);
    }

    public function testUpdate()
    {
        $cast_memberAll = CastMember::factory(1)->create();
        $cast_member = $cast_memberAll->first();

        $data = ["name" => "TesteUpdate", "type" => CastMember::TYPE_ACTOR];
        $cast_member->update($data);

        foreach ($data AS $key => $value) {
            self::assertEquals($value, $cast_member->{$key});
        }
    }

    public function testDelete()
    {
        $cast_member = CastMember::factory()->create();
        $cast_member->delete();
        self::assertNull(CastMember::find($cast_member->id));

        $cast_member->restore();
        self::assertNotNull(CastMember::find($cast_member->id));
    }
}
