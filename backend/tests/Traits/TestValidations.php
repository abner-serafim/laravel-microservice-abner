<?php
declare(strict_types=1);

namespace Tests\Traits;


use Illuminate\Http\UploadedFile;
use Illuminate\Testing\TestResponse;

trait TestValidations
{
    protected $validRequired = 'validation.required';
    protected $validNullable = 'validation.nullable';
    protected $validInteger = 'validation.integer';
    protected $validIn = 'validation.in';
    protected $validArray = 'validation.array';
    protected $validExists = 'validation.exists';
    protected $validDateFormat = 'validation.date_format';
    protected $validMax = 'validation.max.string';
    protected $validBool = 'validation.boolean';

    protected $limitMax = ['max' => 255];
    protected $formatY = ['format' => 'Y'];

    protected abstract function getModel();
    protected abstract function getRouteStore();
    protected abstract function getRouteUpdate();

    protected function assertInvalidationInStoreAction(
        array $data,
        string $rule,
        array $ruleParams = []
    ) {
        $response = $this->json('POST', $this->getRouteStore(), $data);
        $fields = array_keys($data);
        $this->assertInvalidationFields($response, $fields, $rule, $ruleParams);
    }
    protected function assertInvalidationInUpdateAction(
        array $data,
        string $rule,
        array $ruleParams = []
    ) {
        $response = $this->json('PUT', $this->getRouteUpdate(), $data);
        $fields = array_keys($data);
        $this->assertInvalidationFields($response, $fields, $rule, $ruleParams);
    }

    protected function assertInvalidationFields(
        TestResponse $response,
        array $fields,
        string $rule,
        array $ruleParams = []
    ) {
        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors($fields)
        ;

        foreach ($fields as $field) {
            $fieldName = str_replace('_', ' ', $field);
            $response->assertJsonFragment([
                trans($rule, ['attribute' => $fieldName] + $ruleParams)
            ]);
        }
    }

    protected function assertInvalidationFile(
        $field,
        $extension,
        $maxSize,
        $rule,
        $ruleParams = []
    )
    {
        $routes = [
            [
                'method' => 'POST',
                'route' => $this->getRouteStore()
            ],
            [
                'method' => 'PUT',
                'route' => $this->getRouteUpdate()
            ],
        ];

        foreach ($routes AS $route) {
            $file = UploadedFile::fake()->create("$field.1$extension");
            $response = $this->json($route['method'], $route['route'], [
                $field => $file
            ]);

            $this->assertInvalidationFields($response, [$field], $rule, $ruleParams);

            $file = UploadedFile::fake()->create("$field.$extension")->size($maxSize + 1);
            $response = $this->json($route['method'], $route['route'], [
                $field => $file
            ]);

            $this->assertInvalidationFields($response, [$field], 'validation.max.file', ['max' => $maxSize]);
        }
    }
}
