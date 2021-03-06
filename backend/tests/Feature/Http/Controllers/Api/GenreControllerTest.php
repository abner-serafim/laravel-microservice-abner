<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\GenreController;
use App\Http\Resources\GenreResource;
use App\Models\Category;
use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\Request;
use Tests\Exceptions\TestException;
use Tests\Traits\TestResources;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;
use Tests\TestCase;

class GenreControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves, TestResources;

    protected $genre;
    protected $serializedFields = [
        'id',
        'name',
        'is_active',
        'created_at',
        'updated_at',
        'deleted_at',
        'categories' => [
            '*' => [
                'id',
                'name',
                'description',
                'is_active',
                'created_at',
                'updated_at',
                'deleted_at',
            ]
        ]
    ];

    protected function setUp(): void
    {
        parent::setUp(); // TODO: Change the autogenerated stub
        $this->genre = Genre::factory()->create();
    }

    public function testInvalidationData()
    {
        $data = [
            'name' => '',
            'categories_id' => ''
        ];
        $this->assertInvalidationInStoreAction($data, $this->validRequired);
        $this->assertInvalidationInUpdateAction($data, $this->validRequired);

        $data = [
            'name' => str_repeat('a', 256)
        ];
        $this->assertInvalidationInStoreAction($data, $this->validMax, $this->limitMax);
        $this->assertInvalidationInUpdateAction($data, $this->validMax, $this->limitMax);

        $data = [
            'is_active' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, $this->validBool);
        $this->assertInvalidationInUpdateAction($data, $this->validBool);

        $data = [
            'categories_id' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, $this->validArray);
        $this->assertInvalidationInUpdateAction($data, $this->validArray);

        $data = [
            'categories_id' => [100]
        ];
        $this->assertInvalidationInStoreAction($data, $this->validExists);
        $this->assertInvalidationInUpdateAction($data, $this->validExists);

        $category = Category::factory()->create();
        $category->delete();
        $data = [
            'categories_id' => [$category->id]
        ];
        $this->assertInvalidationInStoreAction($data, $this->validExists);
        $this->assertInvalidationInUpdateAction($data, $this->validExists);
    }

    protected function getCategories()
    {
        $category = Category::factory()->create();
        return ['categories_id' => [$category->id]];
    }

    public function testStore()
    {
        $categories = $this->getCategories();

        $data = [
            'name' => 'test'
        ];
        $response = $this->assertStore($data + $categories, $data + ['is_active' => true, 'deleted_at' => null]);
        $this->assertHasCategory($categories['categories_id'][0], $response->json('data.id'));
        $this->assertResourceValid($response);

        $data = [
            'name' => 'teste',
            'is_active' => false
        ];
        $this->assertStore($data + $categories, $data + ['deleted_at' => null]);

        $this->assertHasCategory($categories['categories_id'][0], $response->json('data.id'));
    }

    public function testUpdate()
    {
        $categories = $this->getCategories();

        $this->genre = Genre::factory()->create([
            'is_active' => false
        ]);

        $data = [
            'name' => 'teste',
            'is_active' => true
        ];
        $response = $this->assertUpdate($data + $categories, $data + ['deleted_at' => null]);
        $this->assertResourceValid($response);
        $this->assertHasCategory($categories['categories_id'][0], $response->json('data.id'));
    }

    public function testRollbackStore()
    {
        $controller = $this->mock(GenreController::class)
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();

        $controller
            ->shouldReceive('validate')
            ->withAnyArgs()
            ->andReturn(['name' => 'test']);

        $controller
            ->shouldReceive('getRulesStore')
            ->withAnyArgs()
            ->andReturn([]);

        $controller->shouldReceive('handleRelations')
            ->once()
            ->andThrow(new TestException());

        $request = $this->mock(Request::class);

        $hasError = false;
        try {
            $controller->store($request);
        } catch (TestException $exception) {
            self::assertCount(1, Genre::all());
            $hasError = true;
        }

        self::assertTrue($hasError);
    }

    public function testRollbackUpdate()
    {
        $controller = $this->mock(GenreController::class)
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();

        $controller
            ->shouldReceive('findOrFail')
            ->withAnyArgs()
            ->andReturn($this->genre);

        $controller
            ->shouldReceive('validate')
            ->withAnyArgs()
            ->andReturn(['name' => 'test']);

        $controller
            ->shouldReceive('getRulesUpdate')
            ->withAnyArgs()
            ->andReturn([]);

        $controller->shouldReceive('handleRelations')
            ->once()
            ->andThrow(new TestException());

        $request = $this->mock(Request::class);

        $hasError = false;
        try {
            $controller->update($request, 1);
        } catch (TestException $exception) {
            self::assertCount(1, Genre::all());
            $hasError = true;
        }

        self::assertTrue($hasError);
    }

    protected function assertHasCategory($categoryId, $genreId)
    {
        $this->assertDatabaseHas('category_genre', [
            'category_id' => $categoryId,
            'genre_id' => $genreId,
        ]);
    }

    public function testDestroy()
    {
        $response = $this->json('DELETE', route('api.genres.destroy', $this->genre->id));

        $response
            ->assertStatus(204);

        self::assertNull(Genre::find($this->genre->id));
        self::assertNotNull(Genre::withTrashed()->find($this->genre->id));
    }

    public function testSyncCategories()
    {
        $categoriesId = Category::factory(3)->create()->pluck('id')->toArray();

        $sendData = [
            'name' => 'test',
            'categories_id' => [$categoriesId[0]]
        ];
        $response = $this->json('POST', $this->getRouteStore(), $sendData);
        $this->assertDatabaseHas('category_genre', [
            'category_id' => $categoriesId[0],
            'genre_id' => $response->json('data.id'),
        ]);

        $sendData = [
            'name' => 'test',
            'categories_id' => [$categoriesId[1], $categoriesId[2]]
        ];
        $response = $this->json(
            'PUT',
            route('api.genres.update', $response->json('data.id')),
            $sendData
        );
        $this->assertDatabaseMissing('category_genre', [
            'category_id' => $categoriesId[0],
            'genre_id' => $response->json('data.id'),
        ]);
        $this->assertDatabaseHas('category_genre', [
            'category_id' => $categoriesId[1],
            'genre_id' => $response->json('data.id'),
        ]);
        $this->assertDatabaseHas('category_genre', [
            'category_id' => $categoriesId[2],
            'genre_id' => $response->json('data.id'),
        ]);
    }

    protected function getRouteIndex()
    {
        return route('api.genres.index');
    }

    protected function getRouteShow()
    {
        return route('api.genres.show', $this->genre->id);
    }

    protected function getRouteStore()
    {
        return route('api.genres.store');
    }

    protected function getRouteUpdate()
    {
        return route('api.genres.update', $this->genre->id);
    }

    protected function getModel()
    {
        return Genre::class;
    }

    protected function getModelItem()
    {
        return $this->genre;
    }

    protected function getSerializedFields()
    {
        return $this->serializedFields;
    }

    protected function getResourceCollection(): string
    {
        return $this->getResource();
    }

    protected function getResource(): string
    {
        return GenreResource::class;
    }
}
