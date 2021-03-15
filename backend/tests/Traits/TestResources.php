<?php


namespace Tests\Traits;


use App\Models\Video;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Testing\TestResponse;

trait TestResources
{
    protected abstract function getModel();
    protected abstract function getModelItem();

    protected abstract function getRouteIndex();
    protected abstract function getRouteShow();

    protected abstract function getResource();
    protected abstract function getResourceCollection();
    protected abstract function getSerializedFields();

    public function testIndex()
    {
        $response = $this->get($this->getRouteIndex());
        $response->assertStatus(200);
        $this->assertResourceCollectionValid($response);
        return $response;
    }

    public function testShow()
    {
        $response = $this->get($this->getRouteShow());
        $response->assertStatus(200);
        $this->assertResourceValid($response);
        return $response;
    }

    protected function assertResource(TestResponse $response, JsonResource $resource)
    {
        $response->assertJson(
            $resource->response()->getData(true)
        );
    }

    protected function assertResourceCollectionValid(TestResponse $response)
    {
        $response
            ->assertJson([
                'meta' => ['per_page' => 15]
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => $this->getSerializedFields()
                ],
                'links' => [],
                'meta' => [],
            ]);

        $resourceClass = $this->getResourceCollection();
        $resource = $resourceClass::collection(collect([$this->getModelItem()]));
        $this->assertResource($response, $resource);
    }

    protected function assertResourceValid(TestResponse $response)
    {
        $response->assertJsonStructure([
            'data' => $this->getSerializedFields()
        ]);
        $id = $response->json('data.id');
        $resourceClass = $this->getResourceCollection();
        $model = $this->getModel();
        $resource = new $resourceClass($model::find($id));
        $this->assertResource($response, $resource);
    }
}
