<?php
declare(strict_types=1);

namespace Tests\Feature\Traits;


use Illuminate\Testing\TestResponse;

trait TestValidations
{
    protected $validRequired = 'validation.required';
    protected $validMax = 'validation.max.string';
    protected $validBool = 'validation.boolean';

    protected $limitMax = ['max' => 255];

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
}