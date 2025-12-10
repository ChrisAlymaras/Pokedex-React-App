import React from 'react';
import './PokemonCard.css'
import { cardBackgrounds,typeBackgrounds } from '../../public/ColorTypes';

class PokemonCard extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            details: null,
            activeTab: "info",
            evolutionChain: null,
            evolutionLoaded: false,
        };
    }
    /*fetch pokemon info*/
    componentDidMount(){
        try {
            fetch(this.props.url)
                .then(result => result.json())
                .then(data => {
                    this.setState({details: data})
                });
        } catch (e) {
            alert("Error catching pokemons");
            console.log(e);
        }
    }

    /*prevent stuck when scrolling on card stats*/
    componentDidUpdate(prevProps) {
        if (prevProps.expanded && !this.props.expanded) {
            /*reset scrolling if closed a card*/
            const card = document.querySelector(`.pokemon-card[data-name="${this.props.name}"]`);
            if (card) card.scrollTop = 0;
        }
    }

    /*return all stages of a pokemon in array form*/
    parseEvolutionChain = async (chain) => {
        const stages = [];

        /*walk function searches deeper all pokemon forms in recursive way*/
        const walk = async (node) => {
            const name = node.species.name;

            /*fetch again to store exact sprite*/
            const pokeResult = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            const pokeData = await pokeResult.json();

            stages.push({
                name,
                sprite: pokeData.sprites.other["official-artwork"].front_default,
            });

            /*dive deeper to next pokemon evolution*/
            if (node.evolves_to.length > 0) {
                await walk(node.evolves_to[0]);
            }
        };

        await walk(chain);
        return stages;
    };

    /*fetch species url to extract evolution_chain and store data in this.state.evolutionChain*/
    loadEvolutionChain = async ()=> {
        const {details} = this.state;
        try{
            /*fetch species*/
            const speciesResult = await fetch(details.species.url);
            const speciesData = await speciesResult.json();

            /*fetch evolution chain*/
            const evolutionResult = await fetch(speciesData.evolution_chain.url);
            const evolutionData = await evolutionResult.json();

            const chain = await this.parseEvolutionChain(evolutionData.chain);

            /*store data to state.evolutionChain*/
            this.setState({
                evolutionChain: chain,
                evolutionLoaded:true,
            });
        }catch(e){
            alert("Error fetching evolution chain");
            console.log(e);
        }
    };


    /*declare set tab to navigate betweem info, stats, evolution*/
    setTab = async (tab) =>{
        this.setState({activeTab:tab});
        /*fetch data only when clicked for better performance*/
        if (tab === "evolution" && this.state.evolutionLoaded === false){
            await this.loadEvolutionChain();
        }
    };

    formatStatName(name) {
        return name
            .replace("special-", "Special ")
            .replace("attack", "Attack")
            .replace("defense", "Defense")
            .replace("hp", "HP")
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }


    render() {
        const {details,activeTab,evolutionChain,evolutionLoaded} = this.state;
        const {expanded,expandCard,closeCard} = this.props;

        if (!details) return <p>Catching 'em all...</p>;

        /*match type with imported colorTypes*/
        const bgColor = cardBackgrounds[details.types[0].type.name];


        /*hold every type of selected pokemon*/
        const allTypes= details.types.map(obj=>obj.type.name);

        /*hold every ability of selected pokemon*/
        const allAbilities = details.abilities.map(obj=>obj.ability.name.toUpperCase());
        return (
            <div className={`pokemon-card ${expanded ? "expanded": "" }`}
                 style={{backgroundColor: bgColor}}
                 onClick={!expanded ? expandCard : null}
                 data-name={details.name}>

                <div className="card-header">
                    <h2>{details.name.toUpperCase()}</h2>
                    <p className="pokemon-id">#{details.id}</p>
                </div>

                <div className="card-body">
                    <div className="pokemon-types">
                        {allTypes.map(obj=>(
                            <span
                                style={{backgroundColor: typeBackgrounds[obj]}}
                                className="solo-type"
                                key={obj}
                            >
                                {obj}
                            </span>
                        ))}
                    </div>
                    <img src={details.sprites.other["official-artwork"].front_default} alt={details.name} />
                    <div className="pokeball"></div>
                </div>

                {/*expanded declarations*/}
                {expanded && (
                    <div className="expanded-content">
                        <div className="tabs" style={{backgroundColor:bgColor}}>
                            <button className={activeTab === "info" ? "info":""} onClick={()=>this.setTab("info")}>Info</button>
                            <button className={activeTab === "stats" ? "stats":""} onClick={()=>this.setTab("stats")}>Statistics</button>
                            <button className={activeTab === "evolution" ? "evolution":""} onClick={()=>this.setTab("evolution")}>Evolution</button>
                        </div>

                        <div className="tab-content">
                            {activeTab === "info" && (
                                <div className="info-tab">
                                    <p><b>Height:</b> {details.height}cm</p>
                                    <p><b>Weight:</b> {details.weight}kg</p>
                                    <p><b>Base Experience:</b> {details.base_experience}xp</p>
                                    <p><b>Abilities:</b><span className="abilities"> {allAbilities.join(" | ")}</span></p>
                                </div>
                            )}
                            {activeTab === "stats" && (
                                <div className="stats-container">
                                    <h3 className="stats-title">Base Stats</h3>

                                    {details.stats.map((s, i) => (
                                        <div key={i} className="stat-row">
                                            <div className="stat-label">
                                                {this.formatStatName(s.stat.name)} {s.base_stat}
                                            </div>

                                            <div className="stat-bar">
                                                <div
                                                    className="stat-bar-fill"
                                                    style={{
                                                        width: `${(s.base_stat / 150) * 100}%`,
                                                        backgroundColor: `${s.base_stat < 60 ? "red" :
                                                            s.base_stat < 80 ? "orange" :
                                                                "green"}`
                                                }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}

                                    <p className="stats-total">
                                        <b>Total:</b> {details.stats.reduce((sum, s) => sum + s.base_stat, 0)}
                                    </p>
                                </div>
                            )}
                            {activeTab === "evolution" && (
                                <div className="evo-tab">
                                    {!evolutionLoaded ? (
                                        <p>Loading evolution Chain...</p>
                                    ):(
                                        <div className="evo-row">
                                            {evolutionChain.map((evo)=>(
                                                <div key={evo.name} className="evo-stage">
                                                    <img className="evo-image" src={evo.sprite} alt={evo.name} />
                                                    <p className="capitalize">{evo.name.toUpperCase()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <button onClick={closeCard}>Close</button>
                    </div>
                )}
            </div>
        );
    }
}


export  { PokemonCard };