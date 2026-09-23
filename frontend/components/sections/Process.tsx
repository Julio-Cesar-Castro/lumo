export function Process() {
  return (
    <>
      <section className="workflow" id="processo">
        <div className="wrap section">
          <div className="eyebrow">Simples do início ao lançamento</div>
          <h2>
            Uma boa parceria.
            <br />
            Um caminho claro.
          </h2>
          <div className="steps">
            {[
              [
                '01',
                'Primeiro, a gente escuta.',
                'Conhecemos seu negócio, seus desafios e o que você quer alcançar. A solução começa com as perguntas certas.',
              ],
              [
                '02',
                'Depois, conectamos as ideias.',
                'Definimos o escopo e criamos a solução. Você acompanha o projeto e participa das decisões, sem complicação.',
              ],
              [
                '03',
                'Pronto para dar o próximo passo.',
                'Validamos os detalhes, colocamos tudo no ar e orientamos você para aproveitar sua nova solução.',
              ],
            ].map(([n, t, p]) => (
              <div key={n}>
                <div className="step-number">{n}</div>
                <h3>{t}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
