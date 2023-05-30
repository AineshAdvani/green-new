import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Product = ({ product, provider, account, greenplanet, togglePop }) => {
    const [hasBought, setHasBought] = useState(false)
    const [hasLended, setHasLended] = useState(false)
    const [hasInspected, setHasInspected] = useState(false)
    const [hasSold, setHasSold] = useState(false)

    const [buyer, setBuyer] = useState(null)
    const [lender, setLender] = useState(null)
    const [inspector, setInspector] = useState(null)
    const [seller, setSeller] = useState(null)

    const [owner, setOwner] = useState(null)
    const fetchDetails = async () => {
        // -- Buyer

        const buyer = await greenplanet.buyer(product.id)
        setBuyer(buyer)

        const hasBought = await greenplanet.approval(product.id, buyer)
        setHasBought(hasBought)

        // -- Seller

        const seller = await greenplanet.seller()
        setSeller(seller)

        const hasSold = await greenplanet.approval(product.id, seller)
        setHasSold(hasSold)

        // -- Lender

        const lender = await greenplanet.lender()
        setLender(lender)

        const hasLended = await greenplanet.approval(product.id, lender)
        setHasLended(hasLended)

        // -- Inspector

        const inspector = await greenplanet.inspector()
        setInspector(inspector)

        // const hasInspected = await greenplanet.inspectionPassed(product.id)
        // setHasInspected(hasInspected)
    }
    const fetchOwner = async () => {
        if (await greenplanet.isListed(product.id)) return

        const owner = await greenplanet.buyerof(product.id)
        setOwner(owner)
    }
    const buyHandler = async () => {
        const greenplanetAmount = await greenplanet.amount(product.id)
        const signer = await provider.getSigner()
        console.log("inside")
        // Buyer approves...
        const transaction = await greenplanet.connect(signer).approve(product.id)
        await transaction.wait()

        setHasBought(true)
    }

    const inspectHandler = async () => {
        const signer = await provider.getSigner()

        // Inspector updates status
        console.log("inspector")
        const transaction = await greenplanet.connect(signer).updateInspection(product.id, true)
        await transaction.wait()

        setHasInspected(true)
    }


    const sellHandler = async () => {
        const signer = await provider.getSigner()

        // Seller approves...
        let transaction = await greenplanet.connect(signer).approve(product.id)
        await transaction.wait()

        // Seller finalize...
        transaction = await greenplanet.connect(signer).finalizeProcess(product.id)
        await transaction.wait()

        setHasSold(true)
    }
    useEffect(() => {
        fetchDetails()
        fetchOwner()
    }, [hasSold])
    return (
        <div className="product">
            <div className="product__details">
                <div  className="product__image">
                    <img src = {product.image} alt = "Product"/>
                </div>
                <div className="product__overview">
                    <h1>{product.name}</h1>
                    <p>
                        <strong>{product.attributes[2].value}</strong> bds |
                        <strong>{product.attributes[3].value}</strong> ba |
                        <strong>{product.attributes[4].value}</strong> sqft
                    </p>
                    <p>{product.address}</p>
                    <h2>{product.attributes[0].value} ETH</h2>

                    {owner ? (
                        <div className='product__owned'>
                            Owned by {owner.slice(0, 6) + '...' + owner.slice(38, 42)}
                        </div>
                    ) : (
                        <div>
                            {(account === inspector) ? (
                                <button className='product__buy' onClick={inspectHandler} disabled={hasInspected}>
                                    Approve Inspection
                                </button>
                            ) : (account === seller) ? (
                                <button className='product__buy' onClick={sellHandler} disabled={hasSold}>
                                    Approve & Sell
                                </button>
                            ) : (
                                <button className='product__buy' onClick={buyHandler} disabled={hasBought}>
                                    Buy
                                </button>
                            )}
                    <button className='product__contact' >
                        Contact Seller
                    </button>
                        </div>
                    )}
                    <hr />
                    <h2>Overview</h2>
                    <p>{product.description}</p>
                    <hr/>
                    <h2>Features</h2>
                    <ul>
                    {product.attributes.map((attribute, index) => (
                            <li key={index}><strong>{attribute.trait_type}</strong> : {attribute.value}</li>
                        ))}
                    </ul>
                    
                </div>
            </div>
        
            <button onClick={togglePop} className="product__close">
                    <img src={close} alt="Close" />
            </button>
        </div>
    );
}

export default Product;
