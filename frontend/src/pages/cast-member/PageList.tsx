// @flow
import * as React from 'react';
import {Page} from "../../components/Page";
import {Box, Fab} from "@material-ui/core";
import {Link} from "react-router-dom";
import AddIcon from '@material-ui/icons/Add';
import Table from "./Table";
import routes, {MyRouteProps} from "../../routes";

type Props = {

};
const PageList = (props: Props) => {

    const route: MyRouteProps = routes.find((route) => route.name === "cast_members.create") as MyRouteProps;

    return (
        <Page title="Listar membros do elencos">
            <Box dir={'rtl'} paddingBottom={2}>
                <Fab
                    title={"Adicionar membro do elencos"}
                    color={"secondary"}
                    size="small"
                    component={Link}
                    to={route.path as string}
                >
                    <AddIcon />
                </Fab>
            </Box>
            <Box>
                <Table />
            </Box>
        </Page>
    );
};

export default PageList;
