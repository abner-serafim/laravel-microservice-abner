// @flow
import * as React from 'react';
import {useEffect, useState} from "react";
import {formatIsoToDTH} from "../../utils/date";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import genreHttp from "../../services/http/genre-http";
import {CastMember, Category, Genre, ListResponse} from "../../services/models";
import {DefaultTable, TableColumn} from "../../components/Table";
import castMemberHttp from "../../services/http/cast-member-http";

const columnDefinitions: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '25%',
        options: {
            sort: false
        },
    },
    {
        name: 'name',
        label: 'Nome',
        width: '25%',
    },
    {
        name: 'categories',
        label: 'Categorias',
        width: '25%',
        options: {
            customBodyRender(values, tableMeta, updateValue) {
                return values.map((value: Category) => value.name).join(', ');
            }
        }
    },
    {
        name: 'is_active',
        label: 'Ativo?',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes /> : <BadgeNo />;
            }
        }
    },
    {
        name: 'created_at',
        label: 'Criado em',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{formatIsoToDTH(value)}</span>;
            }
        }
    },
    {
        name: 'actions',
        label: 'Ações',
        width: '13%',
    },
];

type Props = {

};
const Table = (props: Props) => {

    const [data, setData] = useState<Genre[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let isCancelled = false;

        (async () => {
            setLoading(true);

            try {
                const {data} = await genreHttp.list<ListResponse<Genre>>();
                if (isCancelled) return;
                setData(data.data);
            } catch (e) {

            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isCancelled = true;
        }
    }, []);

    return (
        <DefaultTable
            isLoading={loading}
            columns={columnDefinitions}
            data={data}
            title={""}
        />
    );
};

export default Table;
