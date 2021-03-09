<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

abstract class BasicCrudController extends Controller
{
    protected int $paginationSize = 15;
    protected bool $useTransaction = true;

    protected abstract function getModel(): string;
    protected abstract function getRulesStore(): array;
    protected abstract function getRulesUpdate(): array;
    protected abstract function getResource(): string;
    protected abstract function getResourceCollection();
    protected abstract function handleRelations($obj, Request $request): void;

    public function index()
    {
        $data = !$this->paginationSize ? $this->getModel()::all() : $this->getModel()::paginate($this->paginationSize);
        $resourceCollection = $this->getResourceCollection();
        $refClass = new \ReflectionClass($this->getResourceCollection());
        return $refClass->isSubclassOf(ResourceCollection::class)
            ? new $resourceCollection($data)
            : $resourceCollection::collection($data);
    }

    public function store(Request $request)
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
        $resource = $this->getResource();
        return new $resource($obj);
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

    public function show($id)
    {
        $obj = $this->findOrFail($id);

        $resource = $this->getResource();
        return new $resource($obj);
    }

    public function update(Request $request, $id)
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

        $resource = $this->getResource();
        return new $resource($obj);
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
