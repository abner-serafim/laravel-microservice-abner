<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\BasicCrudController;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Validation\ValidationException;
use Tests\Stubs\Controllers\Api\CategoryControllerStub;
use Tests\Stubs\Models\CategoryStub;
use Tests\TestCase;

class BasicCrudControllerTest extends TestCase
{
    // use DatabaseMigrations, TestValidations, TestSaves;
    private $controller;
    private $example = ['name' => 'test_name', 'description' => 'test_description'];

    protected function setUp(): void
    {
        parent::setUp();
        CategoryStub::dropTable();
        CategoryStub::createTable();
        $this->controller = new CategoryControllerStub();
    }

    protected function tearDown(): void
    {
        CategoryStub::dropTable();
        parent::tearDown();
    }

    public function testIndex()
    {
        CategoryStub::create($this->example);
        $result = $this->controller->index()->toJson();
        $resultTest = CategoryResource::collection(CategoryStub::paginate(15))->toJson();
        self::assertEquals($resultTest, $result);
    }

    public function testInvalidationDataInStore()
    {
        $request = $this->mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => '']);

        $this->expectException(ValidationException::class);
        $this->controller->store($request);
    }

    public function testStore()
    {
        $request = $this->mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn($this->example);

        /** @var CategoryResource $obj */
        $obj = $this->controller->store($request);
        self::assertEquals(
            (new CategoryResource(CategoryStub::find($obj->id)))->toJson(),
            $obj->toJson()
        );
    }

    public function testIfFindOrFailFetchModel()
    {
        /** @var CategoryStub $category */
        $category = CategoryStub::create($this->example);

        $reflectionClass = new \ReflectionClass(BasicCrudController::class);
        $reflectionClass = $reflectionClass->getMethod('findOrFail');
        $reflectionClass->setAccessible(true);

        $result = $reflectionClass->invokeArgs($this->controller, [$category->id]);
        self::assertInstanceOf(CategoryStub::class, $result);
    }

    public function testShow()
    {
        /** @var CategoryStub $category */
        $category = CategoryStub::create($this->example);

        $result = $this->controller->show($category->id);
        self::assertEquals(
            (new CategoryResource(CategoryStub::find($category->id)))->toJson(),
            $result->toJson()
        );
    }

    public function testUpdate()
    {
        /** @var CategoryStub $category */
        $category = CategoryStub::create($this->example);

        $request = $this->mock(Request::class);
        $request
            ->shouldReceive('all')
            ->once()
            ->andReturn(['name' => 'test_name_changed', 'description' => 'test_description_changed']);

        $result = $this->controller->update($request, $category->id);
        self::assertEquals(
            (new CategoryResource(CategoryStub::find($category->id)))->toJson(),
            $result->toJson()
        );
    }

    public function testDestroy()
    {
        /** @var CategoryStub $category */
        $category = CategoryStub::create($this->example);
        $response = $this->controller->destroy($category->id);
        $this
            ->createTestResponse($response)
            ->assertStatus(204);

        self::assertCount(0, CategoryStub::all());
    }
}
