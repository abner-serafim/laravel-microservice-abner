import {PaletteColorOptions} from "@material-ui/core";

declare module '@material-ui/core/styles/overrides' {
    interface ComponentNameToClassKey {
        MUIDataTable: any;
        MUIDataTableToolbar: MUIDataTableToolbar;
        MUIDataTableHeadCell: MUIDataTableHeadCell;
        MUIDataTableSelectCell: MUIDataTableSelectCell;
        MUIDataTableBodyCell: MUIDataTableBodyCell;
        MUIDataTableToolbarSelect: MUIDataTableToolbarSelect;
        MUIDataTableBodyRow: MUIDataTableBodyRow;
        MUIDataTablePagination: MUIDataTablePagination;
    }
}
