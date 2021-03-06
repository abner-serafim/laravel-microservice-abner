<?php

namespace Tests\Feature\Http\Controllers\Api\Video;

use App\Http\Controllers\Api\VideoController;
use App\Models\Category;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Exceptions\TestException;
use Tests\Traits\TestResources;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;
use Tests\TestCase;

class VideoCrudControllerTest extends VideoBaseControllerTest
{
    use TestResources;

    public function testInvalidationRequired()
    {
        $data = [
            'title' => '',
            'description' => '',
            'year_launched' => '',
            'rating' => '',
            'duration' => '',
            'categories_id' => '',
            'genres_id' => '',
        ];
        $this->assertInvalidationInStoreAction($data, $this->validRequired);
        $this->assertInvalidationInUpdateAction($data, $this->validRequired);
    }

    public function testInvalidationMax()
    {
        $data = [
            'title' => str_repeat('a', 256)
        ];
        $this->assertInvalidationInStoreAction($data, $this->validMax, $this->limitMax);
        $this->assertInvalidationInUpdateAction($data, $this->validMax, $this->limitMax);
    }

    public function testInvalidationInteger()
    {
        $data = [
            'duration' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, $this->validInteger);
        $this->assertInvalidationInUpdateAction($data, $this->validInteger);
    }

    public function testInvalidationBoolean()
    {
        $data = [
            'opened' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, $this->validBool);
        $this->assertInvalidationInUpdateAction($data, $this->validBool);
    }

    public function testInvalidationRating()
    {
        $data = [
            'rating' => 'a',
        ];
        $this->assertInvalidationInStoreAction($data, $this->validIn);
        $this->assertInvalidationInUpdateAction($data, $this->validIn);

        $data = [
            'rating' => 0,
        ];
        $this->assertInvalidationInStoreAction($data, $this->validIn);
        $this->assertInvalidationInUpdateAction($data, $this->validIn);
    }

    public function testInvalidationCategoriesIdField()
    {
        $data = [
            'categories_id' => 'a',
        ];
        $this->assertInvalidationInStoreAction($data, $this->validArray);
        $this->assertInvalidationInUpdateAction($data, $this->validArray);

        $data = [
            'categories_id' => [100],
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

    public function testInvalidationGenresIdField()
    {
        $data = [
            'genres_id' => 'a',
        ];
        $this->assertInvalidationInStoreAction($data, $this->validArray);
        $this->assertInvalidationInUpdateAction($data, $this->validArray);

        $data = [
            'genres_id' => [100],
        ];
        $this->assertInvalidationInStoreAction($data, $this->validExists);
        $this->assertInvalidationInUpdateAction($data, $this->validExists);

        $genre = Genre::factory()->create();
        $genre->delete();
        $data = [
            'genres_id' => [$genre->id]
        ];
        $this->assertInvalidationInStoreAction($data, $this->validExists);
        $this->assertInvalidationInUpdateAction($data, $this->validExists);
    }

    public function testInvalidationYearLaunchedField()
    {
        $data = [
            'year_launched' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, $this->validDateFormat, $this->formatY);
        $this->assertInvalidationInUpdateAction($data, $this->validDateFormat, $this->formatY);
    }

    public function testStoreUpdate()
    {
        /** @var Category $category */
        $category = Category::factory()->create();
        /** @var Genre $genre */
        $genre = Genre::factory()->create();
        $genre->categories()->sync([$category->id]);

        $cat_gen = [
            'categories_id' => [$category->id],
            'genres_id' => [$genre->id],
        ];

        $datas = [
            [
                'send_data' => $this->sendData + ['opened' => false] + $cat_gen,
                'test_data' => $this->sendData + ['opened' => false],
            ],
            [
                'send_data' => $this->sendData + ['opened' => true] + $cat_gen,
                'test_data' => $this->sendData + ['opened' => true],
            ],
            [
                'send_data' => $this->sendData + ['rating' => Video::RATING_LIST[1]] + $cat_gen,
                'test_data' => $this->sendData + ['rating' => Video::RATING_LIST[1]],
            ],
        ];

        $responseStore = null;
        $responseUpdate = null;

        foreach ($datas AS $data) {
            $responseStore = $this->assertStore($data['send_data'], $data['test_data']);
            $this->assertHasCategory($cat_gen['categories_id'][0], $responseStore->json('data.id'));
            $this->assertHasGenre($cat_gen['genres_id'][0], $responseStore->json('data.id'));
            $responseUpdate = $this->assertUpdate($data['send_data'], $data['test_data']);
            $this->assertHasCategory($cat_gen['categories_id'][0], $responseStore->json('data.id'));
            $this->assertHasGenre($cat_gen['genres_id'][0], $responseStore->json('data.id'));
        }

        if ($responseStore) $this->assertResourceValid($responseStore);

        if ($responseUpdate) $this->assertResourceValid($responseUpdate);
    }

    /*public function testRollbackStore()
    {
        $controller = $this->mock(VideoController::class)
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();

        $controller
            ->shouldReceive('validate')
            ->withAnyArgs()
            ->andReturn($this->sendData);

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
            dd("Count" . Video::all()->count());
            self::assertCount(1, Video::all());
            $hasError = true;
        }

        self::assertTrue($hasError);
    }

    public function testRollbackUpdate()
    {
        $controller = $this->mock(VideoController::class)
            ->makePartial()
            ->shouldAllowMockingProtectedMethods();

        $controller
            ->shouldReceive('findOrFail')
            ->withAnyArgs()
            ->andReturn($this->video);

        $controller
            ->shouldReceive('validate')
            ->withAnyArgs()
            ->andReturn($this->sendData);

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
            self::assertCount(1, Video::all());
            $hasError = true;
        }

        self::assertTrue($hasError);
    }

    public function testSyncCategories()
    {
        $categoriesId = Category::factory(3)->create()->pluck('id')->toArray();
        $genre = Genre::factory()->create();
        $genre->categories()->sync($categoriesId);
        $genreId = $genre->id;

        $response = $this->json(
            'POST',
            $this->getRouteStore(),
            $this->sendData + [
                'genres_id' => [$genreId],
                'categories_id' => [$categoriesId[0]]
            ]
        );
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoriesId[0],
            'video_id' => $response->json('id'),
        ]);

        $sendData = $this->sendData + [
            'genres_id' => [$genreId],
            'categories_id' => [$categoriesId[1], $categoriesId[2]]
        ];
        $response = $this->json(
            'PUT',
            route('api.videos.update', $response->json('id')),
            $sendData
        );
        $this->assertDatabaseMissing('category_video', [
            'category_id' => $categoriesId[0],
            'video_id' => $response->json('id'),
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoriesId[1],
            'video_id' => $response->json('id'),
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoriesId[2],
            'video_id' => $response->json('id'),
        ]);
    }

    public function testSyncGenres()
    {
        $genres = Genre::factory(3)->create();
        $genreId = $genres->pluck('id')->toArray();
        $categoryId = Category::factory()->create()->id;
        $genres->each(function ($genre) use ($categoryId) {
            $genre->categories()->sync($categoryId);
        });

        $response = $this->json(
            'POST',
            $this->getRouteStore(),
            $this->sendData + [
                'categories_id' => [$categoryId],
                'genres_id' => [$genreId[0]]
            ]
        );
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genreId[0],
            'video_id' => $response->json('id'),
        ]);

        $sendData = $this->sendData + [
            'categories_id' => [$categoryId],
            'genres_id' => [$genreId[1], $genreId[2]]
        ];
        $response = $this->json(
            'PUT',
            route('api.videos.update', $response->json('id')),
            $sendData
        );
        $this->assertDatabaseMissing('genre_video', [
            'genre_id' => $genreId[0],
            'video_id' => $response->json('id'),
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genreId[1],
            'video_id' => $response->json('id'),
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genreId[2],
            'video_id' => $response->json('id'),
        ]);
    }*/

    public function testDestroy()
    {
        $response = $this->json('DELETE', route('api.videos.destroy', $this->video->id));

        $response
            ->assertStatus(204);

        self::assertNull(Video::find($this->video->id));
        self::assertNotNull(Video::withTrashed()->find($this->video->id));
    }
}
