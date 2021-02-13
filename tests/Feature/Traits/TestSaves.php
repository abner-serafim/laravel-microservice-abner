<?php


namespace Tests\Feature\Traits;


use Illuminate\Testing\TestResponse;

trait TestSaves
{
    protected function assertStore(array $sendData, array $testDatabase, array $testJsonData = []): TestResponse
    {
        /** @var TestResponse $response */
        $response = $this->json('POST', $this->getRouteStore(), $sendData);
        if ($response->status() !== 201) {
            throw new \Exception("Responsse status must be 201, given {$response->status()}:\n{$response->content()}");
        }
        $this->assertInDatabase($response, $testDatabase);
        $this->assertJsonResponseContent($response, $testDatabase, $testJsonData);
        return $response;
    }

    protected function assertUpdate(array $sendData, array $testDatabase, array $testJsonData = []): TestResponse
    {
        /** @var TestResponse $response */
        $response = $this->json('PUT', $this->getRouteUpdate(), $sendData);
        if ($response->status() !== 200) {
            throw new \Exception("Responsse status must be 201, given {$response->status()}:\n{$response->content()}");
        }
        $this->assertInDatabase($response, $testDatabase);
        $this->assertJsonResponseContent($response, $testDatabase, $testJsonData);
        return $response;
    }

    private function assertInDatabase(TestResponse $response, array $testDatabase)
    {
        $model = $this->getModel();
        $table = (new $model)->getTable();
        $this->assertDatabaseHas($table, $testDatabase + ["id" => $response->json('id')]);
    }

    private function assertJsonResponseContent(TestResponse $response, array $testDatabase, array $testJsonData)
    {
        $testResponse = $testJsonData ?? $testDatabase;
        $response->assertJsonFragment($testResponse + ["id" => $response->json('id')]);
    }
}
