import Head from 'next/head'
import { useEffect, useState } from 'react'
import { generateSolidityFromNodes } from '../lib/generator'

type Node = {
  id: string;
  type: string;
  props: Record<string, any>;
};

export default function Home(){
  const [nodes, setNodes] = useState<Node[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(()=>{
    
    const palette = document.querySelectorAll('.draggable');
    const canvas = document.getElementById('canvas');
    const nodesList = document.getElementById('nodes');
    const solidityEl = document.getElementById('solidity');

    palette.forEach(el=>{
      el.addEventListener('dragstart', (e: any)=>{
        e.dataTransfer.setData('text/plain', el.getAttribute('data-type'));
      });
    });

    if(canvas){
      canvas.addEventListener('dragover', (e)=>{
        e.preventDefault();
        canvas.classList.add('drag-over');
      });
      canvas.addEventListener('dragleave', ()=>{
        canvas.classList.remove('drag-over');
      });
      canvas.addEventListener('drop', (e)=>{
        e.preventDefault();
        canvas.classList.remove('drag-over');
        const type = (e as DragEvent).dataTransfer?.getData('text/plain');
        if(!type) return;
        const id = Date.now().toString(36);
        const defaultProps = type==='erc20' ? {name:'MyToken',symbol:'MTK',supply:1000} : {name:'MyNFT',baseUri:'https://ipfs.io/ipfs/'};
        const newNodes = [...nodes, {id,type,props:defaultProps}];
        setNodes(newNodes);
      });
    }
  },[nodes]);

  useEffect(()=>{
    
    const solidityEl = document.getElementById('solidity');
    if(solidityEl){
      solidityEl.textContent = generateSolidityFromNodes(nodes);
    }
    
    
    const nodesList = document.getElementById('nodes');
    if(nodesList){
      if(nodes.length===0){
        nodesList.innerHTML = '<li class="drop-hint">No components yet</li>';
      } else {
        nodesList.innerHTML = nodes.map(n=>`
          <li class="node" data-id="${n.id}">
            <div class="meta">
              <strong>${n.type.toUpperCase()}</strong> — ${n.props.name}
            </div>
            <div>
              <button onclick="window.editNode('${n.id}')">Edit</button>
              <button onclick="window.removeNode('${n.id}')">Remove</button>
            </div>
          </li>
        `).join('');
      }
    }
  },[nodes]);

  
  useEffect(()=>{
    (window as any).editNode = (id: string)=>{
      setEditingId(id);
      const node = nodes.find(n=>n.id===id);
      if(!node) return;
      
      const modal = document.getElementById('modal');
      const form = document.getElementById('edit-form') as HTMLFormElement;
      if(modal && form){
        modal.classList.remove('hidden');
        (form.elements.namedItem('name') as HTMLInputElement).value = node.props.name || '';
        if(node.type==='erc20'){
          (form.elements.namedItem('symbol') as HTMLInputElement).value = node.props.symbol || '';
          (form.elements.namedItem('supply') as HTMLInputElement).value = node.props.supply || 0;
        } else if(node.type==='nft'){
          (form.elements.namedItem('baseUri') as HTMLInputElement).value = node.props.baseUri || '';
        }
      }
    };

    (window as any).removeNode = (id: string)=>{
      setNodes(nodes.filter(x=>x.id!==id));
    };
  },[nodes, editingId]);

  const handleFormSubmit = (e: React.FormEvent)=>{
    e.preventDefault();
    if(!editingId) return;
    
    const form = e.target as HTMLFormElement;
    const node = nodes.find(n=>n.id===editingId);
    if(!node) return;

    node.props.name = (form.elements.namedItem('name') as HTMLInputElement).value || node.props.name;
    if(node.type==='erc20'){
      node.props.symbol = (form.elements.namedItem('symbol') as HTMLInputElement).value || node.props.symbol;
      node.props.supply = Number((form.elements.namedItem('supply') as HTMLInputElement).value) || node.props.supply;
    } else if(node.type==='nft'){
      node.props.baseUri = (form.elements.namedItem('baseUri') as HTMLInputElement).value || node.props.baseUri;
    }

    setNodes([...nodes]);
    document.getElementById('modal')?.classList.add('hidden');
    setEditingId(null);
  };

  return (
    <>
      <Head>
        <title>Celo No-Code Prototype</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>

      <div className="app">
        <header>
          <h1>Celo No-Code Prototype</h1>
          <p>Drag components → configure → preview Solidity</p>
        </header>

        <main className="workspace">
          <aside className="palette">
            <h2>Palette</h2>
            <div className="draggable" draggable={true} data-type="erc20">ERC20 Token</div>
            <div className="draggable" draggable={true} data-type="nft">NFT Collection</div>
          </aside>

          <section className="canvas" id="canvas">
            <h2>Canvas</h2>
            <div className="drop-hint">Drop components here</div>
            <ul id="nodes"></ul>
          </section>

          <aside className="preview">
            <h2>Solidity Preview</h2>
            <pre id="solidity">
          </aside>
        </main>

        <footer>
          <small>Prototype — Next.js + TypeScript + Tailwind</small>
        </footer>
      </div>

      <div id="modal" className="modal hidden">
        <div className="modal-content">
          <h3>Edit Component</h3>
          <form id="edit-form" onSubmit={handleFormSubmit}>
            <div className="field"><label>Name <input name="name" /></label></div>
            <div className="field erc20-only"><label>Symbol <input name="symbol" /></label></div>
            <div className="field erc20-only"><label>Initial Supply <input name="supply" type="number" min={0} /></label></div>
            <div className="field nft-only hidden"><label>Base URI <input name="baseUri" /></label></div>
            <div className="actions">
              <button type="submit">Save</button> 
              <button type="button" onClick={()=>document.getElementById('modal')?.classList.add('hidden')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
