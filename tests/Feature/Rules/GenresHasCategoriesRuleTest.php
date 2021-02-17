<?php


namespace Rules;


use App\Models\Category;
use App\Models\Genre;
use App\Rules\GenresHasCategoriesRule;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class GenresHasCategoriesRuleTest extends TestCase
{
    use DatabaseMigrations;

    /**
     * @var collection
     */
    private $categories;
    private $genres;

    protected function setUp(): void
    {
        parent::setUp();
        $this->categories = Category::factory(4)->create();
        $this->genres = Genre::factory(2)->create();

        $this->genres[0]->categories()->sync([
            $this->categories[0]->id,
            $this->categories[1]->id,
        ]);
        $this->genres[1]->categories()->sync([
            $this->categories[2]->id,
        ]);
    }

    public function testPassesIsValid()
    {
        $rule = new GenresHasCategoriesRule([
            $this->categories[2]->id
        ]);
        $isValid = $rule->passes('', [
            $this->genres[1]->id
        ]);
        self::assertTrue($isValid);

        $rule = new GenresHasCategoriesRule([
            $this->categories[0]->id,
            $this->categories[2]->id,
        ]);
        $isValid = $rule->passes('', [
            $this->genres[0]->id,
            $this->genres[1]->id,
        ]);
        self::assertTrue($isValid);

        $rule = new GenresHasCategoriesRule([
            $this->categories[0]->id,
            $this->categories[1]->id,
            $this->categories[2]->id,
        ]);
        $isValid = $rule->passes('', [
            $this->genres[0]->id,
            $this->genres[1]->id,
        ]);
        self::assertTrue($isValid);
    }

    public function testPassesIsNotValid()
    {
        $rule = new GenresHasCategoriesRule([
            $this->categories[0]->id,
        ]);
        $isNotValid = $rule->passes('', [
            $this->genres[0]->id,
            $this->genres[1]->id,
        ]);
        self::assertFalse($isNotValid);
    }
}
