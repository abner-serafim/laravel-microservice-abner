<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

abstract class BasicCrudController extends Controller
{
    protected bool $useTransaction = true;

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

        if ($this->useTransaction) {
            /** @var Model $obj */
            $obj = DB::transaction(function () use ($request, $validationData, $self) {
                return $self->storeDB($request, $validationData);
            });
        } else {
            /** @var Model $obj */
            $obj = $this->storeDB($request, $validationData);
        }

        $obj->refresh();
        return $obj;
    }

    public function storeDB(Request $request, array $validationData)
    {
        $obj = $this->getModel()::create($validationData);
        $this->handleRelations($obj, $request);
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

        if ($this->useTransaction) {
            /** @var Model $obj */
            $obj = DB::transaction(function () use ($request, $id, $validationData, $self) {
                return $self->updateDB($request, $id, $validationData);
            });
        } else {
            /** @var Model $obj */
            $obj = $self->updateDB($request, $id, $validationData);
        }

        return $obj;
    }

    public function updateDB(Request $request, $id, array $validationData)
    {
        $obj = $this->findOrFail($id);
        $obj->update($validationData);
        $this->handleRelations($obj, $request);
        return $obj;
    }

    public function destroy($id): Response
    {
        $obj = $this->findOrFail($id);
        $obj->delete();
        return response()->noContent();
    }
}
