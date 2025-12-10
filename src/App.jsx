import {Component, useState} from 'react'
import './App.css'
import { PokemonCard } from './components/PokemonCard.jsx'
import { SearchBar } from './components/SearchBar.jsx'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            pokemons:[],
            searchTerm:"",
            expandedCard:null,
        };
    }

    componentDidMount() {
        let allPokemons = "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0";
        try {
            fetch(allPokemons)
                .then(response => response.json())
                .then(data => {
                    this.setState({pokemons: data.results})
                    console.log(data);
                });
        } catch (e) {
            alert("Creature not found");
            console.log(e);
        }
    }

    searchPokemon = (term) => {
        this.setState({searchTerm:term});
    }

    setExpandedCard = (name) =>{
        if (name) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
        this.setState({expandedCard:name});
    };

    render() {
        {/*show only pokemons that contain the search term example: "Pi" "Pika" "Pikach"*/}
        const {pokemons,searchTerm,expandedCard} = this.state;
        const filtered = pokemons.filter(pokemon=>pokemon.name.includes(searchTerm.toLowerCase()));

        return (
            <div>
                <h1>Pokédex</h1>
                <SearchBar  searchPokemon={this.searchPokemon}/>
                <div className="card-list">
                    {filtered.map(pokemon => (
                        <PokemonCard key={pokemon.name}
                                     name={pokemon.name}
                                     url={pokemon.url}
                                     expanded={expandedCard===pokemon.name}
                                     expandCard={()=>this.setExpandedCard(pokemon.name)}
                                     closeCard={()=>this.setExpandedCard(null)}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

export default App
