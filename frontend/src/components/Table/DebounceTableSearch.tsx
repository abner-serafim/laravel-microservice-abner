import React, {useEffect, useState} from 'react';
import Grow from '@material-ui/core/Grow';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import { makeStyles } from '@material-ui/core/styles';
import {limparSearch} from "./index";
import {useDebounce} from "use-debounce";

const useStyles = makeStyles(
    theme => ({
        main: {
            display: 'flex',
            flex: '1 0 auto',
        },
        searchIcon: {
            color: theme.palette.text.secondary,
            marginTop: '10px',
            marginRight: '8px',
        },
        searchText: {
            flex: '0.8 0',
        },
        clearIcon: {
            '&:hover': {
                color: theme.palette.error.main,
            },
        },
    }),
    { name: 'MUIDataTableSearch' },
);

let notOnSearch: number = 0;

const DebounceTableSearch = ({ options, searchText, onSearch, onHide }) => {
    const classes = useStyles();

    const [searchTextState, setSearchTextState] = useState<string>(!searchText || searchText === limparSearch ? '' : searchText);
    const [searchTextDebounce] = useDebounce(searchTextState, 700);

    useEffect(() => {
        onSearch(searchTextDebounce);
        notOnSearch = 0;
    }, [searchTextDebounce, onSearch]);

    const handleTextChange = event => {
        notOnSearch = 2;
        setSearchTextState(event.target.value);
    };

    const onKeyDown = event => {
        if (event.key === 'Escape') {
            onHide();
        }
    };

    if (searchText === limparSearch && notOnSearch === 0) {
        notOnSearch = 1;
    }

    let value = searchTextState;

    if (notOnSearch === 1) {
        value = '';
    }

    return (
        <Grow appear in={true} timeout={300}>
            <div className={classes.main}>
                <SearchIcon className={classes.searchIcon} />
                <TextField
                    className={classes.searchText}
                    autoFocus={true}
                    InputProps={{
                        'data-test-id': options.textLabels.toolbar.search,
                    }}
                    inputProps={{
                        'aria-label': options.textLabels.toolbar.search,
                    }}
                    value={value || ''}
                    onKeyDown={onKeyDown}
                    onChange={handleTextChange}
                    fullWidth={true}
                    placeholder={options.searchPlaceholder}
                    {...(options.searchProps ? options.searchProps : {})}
                />
                <IconButton className={classes.clearIcon} onClick={onHide}>
                    <ClearIcon />
                </IconButton>
            </div>
        </Grow>
    );
};

export default DebounceTableSearch;
