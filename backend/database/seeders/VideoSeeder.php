<?php

namespace Database\Seeders;

use App\Models\CastMember;
use App\Models\Genre;
use App\Models\Video;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class VideoSeeder extends Seeder
{
    public Collection $allGenres;
    public Collection $allCastMembers;
    public array $relations = [
        'genres_id' => [],
        'categories_id' => [],
        'cast_members_id' => [],
    ];

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $dir = Storage::getDriver()->getAdapter()->getPathPrefix();
        File::deleteDirectory($dir);

        $self = $this;
        $self->allGenres = Genre::all();
        $self->allCastMembers = CastMember::all();
        Model::reguard(); // mass assigment
        Video::factory(100)->make()->each(function (Video $video) use ($self) {
            $self->fetchRelations();

            $videos = [
                'thumb_file' => $this->getImageFile(),
                'banner_file' => $this->getImageFile(),
                'trailer_file' => $this->getVideoFile(),
                'video_file' => $this->getVideoFile(),
            ];

            Video::create(array_merge($video->toArray(), $videos, $self->relations));
        });
        Model::unguard();
    }

    public function fetchRelations()
    {
        $subGenres = $this->allGenres->random(5)->load('categories');
        $categoriesId = [];
        foreach ($subGenres as $genre) {
            array_push($categoriesId, ...$genre->categories->pluck('id')->toArray());
        }
        $categoriesId = array_unique($categoriesId);
        $genresId = $subGenres->pluck('id')->toArray();
        $this->relations['categories_id'] = $categoriesId;
        $this->relations['genres_id'] = $genresId;
        $this->relations['cast_members_id'] = $this->allCastMembers->random(3)->pluck('id')->toArray();
    }

    public function getImageFile()
    {
        return new UploadedFile(storage_path('faker/thumbs/Laravel Framework.png'), 'Laravel Framework.png');
    }

    public function getVideoFile()
    {
        return new UploadedFile(storage_path('faker/videos/01-Como vai funcionar os uploads.mp4'), '01-Como vai funcionar os uploads.mp4');
    }
}
