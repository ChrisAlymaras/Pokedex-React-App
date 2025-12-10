import React from 'react';
import './SearchBar.css';


class SearchBar extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            term: "",
        };
    }

    handleChange = (e)=>{
        this.setState({
            term:e.target.value,
        });
        this.handleSearch();
    }

    handleSearch = ()=>{
        this.props.searchPokemon(this.state.term);
    }


    render(){
        return(
            <div className="search-bar">
                <input type="text"
                       placeholder="'Pikachu' or 'Charmander etc...'"
                       value={this.state.term}
                       onChange={this.handleChange}
                />
                <button onClick={this.handleSearch}>Search</button>
            </div>
        );
    }
}

export { SearchBar };