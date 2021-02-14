<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Http\Controllers\Api\BasicCrudController;
use Illuminate\Http\Request;
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
        /** @var CategoryStub $category */
        $category = CategoryStub::create($this->example);
        $result = $this->controller->index()->toArray();
        self::assertEquals([$category->toArray()], $result);
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

        $obj = $this->controller->store($request);
        self::assertEquals(
            CategoryStub::find($obj->id)->toArray(),
            $obj->toArray()
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
        self::assertEquals($result->toArray(), CategoryStub::find($category->id)->toArray());
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
        self::assertEquals($result->toArray(), CategoryStub::find($category->id)->toArray());
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
