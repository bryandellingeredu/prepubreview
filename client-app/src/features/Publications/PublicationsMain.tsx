
import { useState } from 'react';
import { Publication } from '../../app/models/publication';
import agent from '../../app/api/agent';

export default function PublicationsMain() {

    const [publications, setPublications] = useState<Publication[]>([]);

    const [error, setError] = useState('');

    const handleOnclick = async () => {
        setError('');
        try {
            const response = await agent.Publications.list();
            setPublications(response);
        } catch (error) {
            console.log("Error fetching publications:");
            const err = JSON.stringify(error);
            setError(`Error fetching publications: ${err}`);
        }
    };

 return (
<div>
  <h1 className='industry'>HELLO FROM PUBLICATIONS MAIN</h1>
  <button onClick={handleOnclick}>Get Publications (Protected API)</button>

  {error && <p>{error}</p>}

  {publications.length > 0 && (
                        <div>
                            <h2 className='industry'>PUBLICATIONS</h2>
                            <ul>
                                {publications.map((publication, index) => (
                                    <li key={index}>
                                        <strong className='gibold'>Title:</strong> <span className='gilite'>{publication.title} </span> <br />
                                       
                                        <hr />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
</div>
 )

}