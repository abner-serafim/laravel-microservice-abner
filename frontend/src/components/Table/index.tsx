// @flow
import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn, MUIDataTableOptions, MUIDataTableProps} from "mui-datatables";
import {merge, omit, cloneDeep} from 'lodash';
import {MuiThemeProvider, useTheme} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles";

const defaultOptions: MUIDataTableOptions = {
    print: false,
    download: false,
    textLabels: {
        body: {
            noMatch: "Nenhum registro encontrado",
            toolTip: "Classificar",
        },
        pagination: {
            next: "Próxima página",
            previous: "Página anterior",
            rowsPerPage: "Por anterior",
            displayRows: "de",
        },
        toolbar: {
            search: "Busca",
            downloadCsv: "Download CSV",
            print: "Imprimir",
            viewColumns: "Ver Colunas",
            filterTable: "Filtrar Tabelas",
        },
        filter: {
            all: "Busca",
            title: "FILTROS",
            reset: "LIMPAR",
        },
        viewColumns: {
            title: "Ver Colunas",
            titleAria: "Ver/Esconder Colunas da Tabela",
        },
        selectedRows: {
            text: "registro(s) selecionados",
            delete: "Excluir",
            deleteAria: "Excluir registros selecionados",
        }
    }
};

export interface TableColumn extends MUIDataTableColumn {
    width?: string;
}

interface TableProps extends MUIDataTableProps {
    columns: TableColumn[];
    isLoading?: boolean;
}
export const DefaultTable: React.FC<TableProps> = (props) => {
    function extractMuiDataTableColumns(columns: TableColumn[]): MUIDataTableColumn[] {
        setColumnsWidth(columns);
        return columns.map(column => omit(column, 'width'));
    }

    function setColumnsWidth(columns: TableColumn[]) {
        columns.forEach((column, key) => {
            if (column.width) {
                const fixedHeader = theme.overrides?.MUIDataTableHeadCell?.fixedHeader;
                if (fixedHeader) fixedHeader[`&:nth-child(${key + 2})`] = {
                    width: column.width
                };
            }
        });
    }

    function applyLoading() {
        if (newProps.options?.textLabels?.body) {
            newProps.options.textLabels.body.noMatch =
                newProps.isLoading === true ? 'Carregando...' : newProps.options?.textLabels?.body?.noMatch;
        }
    }

    function getOriginalMuiDataTableProps() {
        return omit(newProps, 'isLoading');
    }

    const theme = cloneDeep<Theme>(useTheme());
    // const matches = useMediaQuery(theme.breakpoints.down('sm'));
    const newProps = merge(
        {options: cloneDeep(defaultOptions)},
        props,
        {columns: extractMuiDataTableColumns(props.columns)},
    );

    applyLoading();

    const originalProps = getOriginalMuiDataTableProps();

    return (
        <MuiThemeProvider theme={theme}>
            <MUIDataTable {...originalProps} />
        </MuiThemeProvider>
    );
};

export const Table = DefaultTable;

export function makeActionStyles(column) {
    return (theme: Theme) => {
        const copyTheme = cloneDeep(theme);
        const selector = `&[data-testeid^=MuiDataTableBodyCell-${column}]`;
        if (copyTheme.overrides?.MUIDataTableBodyCell?.root) {
            copyTheme.overrides.MUIDataTableBodyCell.root[selector] = {
                paddingTop: '0px',
                paddingBottom: '0px',
            };
        }
        return copyTheme;
    }
}
