<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

abstract class BasicCrudController extends Controller
{
    protected abstract function getModel(): string;
    protected abstract function getRulesStore(): array;
    protected abstract function getRulesUpdate(): array;
    protected abstract function handleRelations($obj, Request $request): void;

    public function index(): Collection
    {
        return $this->getModel()::all();
    }

    public function store(Request $request): Model
    {
        $validationData = $this->validate($request, $this->getRulesStore());
        $self = $this;
        /** @var Model $obj */
        $obj = \DB::transaction(function () use ($request, $validationData, $self) {
            /** @var Model $obj */
            $obj = $self->getModel()::create($validationData);
            $self->handleRelations($obj, $request);
            return $obj;
        });

        $obj->refresh();
        return $obj;
    }

    protected function findOrFail($id): Model
    {
        $model = $this->getModel();
        $keyName = (new $model)->getRouteKeyName();
        return $this->getModel()::where($keyName, $id)->firstOrFail();
    }

    public function show($id): Model
    {
        $obj = $this->findOrFail($id);
        return $obj;
    }

    public function update(Request $request, $id): Model
    {
        $validationData = $this->validate($request, $this->getRulesUpdate());
        $self = $this;
        /** @var Video $obj */
        $obj = \DB::transaction(function () use ($request, $id, $validationData, $self) {
            /** @var Video $obj */
            $obj = $self->findOrFail($id);
            $obj->update($validationData);
            $self->handleRelations($obj, $request);
            return $obj;
        });
        return $obj;
    }

    public function destroy($id): Response
    {
        $obj = $this->findOrFail($id);
        $obj->delete();
        return response()->noContent();
    }
}
