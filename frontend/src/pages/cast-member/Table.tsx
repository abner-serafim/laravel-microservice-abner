// @flow
import * as React from 'react';
import {useEffect, useState} from "react";
import {formatIsoToDTH} from "../../utils/date";
import castMemberHttp from "../../services/http/cast-member-http";
import {CastMember, ListResponse} from "../../services/models";
import {DefaultTable, TableColumn} from "../../components/Table";

const columnDefinitions: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '33%',
        options: {
            sort: false
        },
    },
    {
        name: 'name',
        label: 'Nome',
        width: '40%',
    },
    {
        name: 'type_name',
        label: 'Tipo',
    },
    {
        name: 'created_at',
        label: 'Criado em',
        width: '10%',
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

    const [data, setData] = useState<CastMember[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let isCancelled = false;

        (async () => {
            setLoading(true);

            try {
                const {data} = await castMemberHttp.list<ListResponse<CastMember>>();
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
