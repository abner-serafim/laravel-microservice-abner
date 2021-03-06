<?php

namespace Database\Factories;

use App\Models\CastMember;
use Illuminate\Database\Eloquent\Factories\Factory;

class CastMemberFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = CastMember::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $type = CastMember::ALL_TYPE[array_rand(CastMember::ALL_TYPE)];
        return [
            'name' => $this->faker->lastName,
            'type' => $type
        ];
    }
}
