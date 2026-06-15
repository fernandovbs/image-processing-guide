import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Sparkles, 
  Cpu, 
  HelpCircle, 
  Sliders, 
  RefreshCw, 
  Image as ImageIcon, 
  Layers, 
  Eye, 
  Maximize2,
  Info,
  CheckCircle,
  Zap,
  Activity,
  Maximize
} from 'lucide-react';

// --- ESTRUTURA DE DADOS EXPANDIDA DO MAPA MENTAL ---
const filterData = {
  id: 'root',
  label: 'Filtros e Operações de Imagem',
  description: 'Classificação completa de filtros, processamento morfológico e segmentação para processamento digital de imagens.',
  children: [
    {
      id: 'dom-espacial',
      label: '1. Domínio Espacial',
      description: 'Filtros que operam diretamente nos pixels da imagem, alterando o brilho baseado na vizinhança local.',
      category: 'espacial',
      children: [
        {
          id: 'esp-suavizacao',
          label: '1.1. Filtros de Suavização (Passa-Baixa)',
          description: 'Atenuam ruídos e detalhes de alta frequência (transições abruptas), borrando a imagem suavemente.',
          category: 'espacial',
          children: [
            {
              id: 'filtro-media',
              label: 'Filtro de Média (Box Filter)',
              category: 'espacial',
              math: 'g(x,y) = \\frac{1}{m \\cdot n} \\sum_{(s,t) \\in S_{xy}} f(s,t)',
              details: 'Substitui o pixel pela média aritmética da vizinhança retangular. Reduz pequenos detalhes e ruídos dispersos.',
              useCases: [
                'Remover pequenos ruídos isolados.',
                'Fazer a transição suave de bordas geométricas.',
                'Pré-processar imagens para unir grandes objetos antes da etapa de segmentação.'
              ],
              simType: 'blur'
            },
            {
              id: 'filtro-mediana',
              label: 'Filtro de Mediana (Não Linear)',
              category: 'espacial',
              math: 'g(x,y) = \\text{mediana} \\{ f(s,t) \\}',
              details: 'Ordena os valores da vizinhança e seleciona o elemento central. Altamente eficaz contra ruído impulsivo preservando bordas.',
              useCases: [
                'Excelente redução de ruído "Sal e Pimenta" (ruídos impulsivos/binários).',
                'Redução de ruído com muito menos borramento do que os filtros lineares como média.',
                'Preservação de descontinuidades bruscas e cantos de objetos.'
              ],
              simType: 'median'
            }
          ]
        },
        {
          id: 'esp-agucamento',
          label: '1.2. Filtros de Aguçamento (Passa-Alta)',
          description: 'Destacam detalhes finos e transições de cor (bordas), atenuando tons homogêneos de baixa variação.',
          category: 'espacial',
          children: [
            {
              id: 'filtro-sobel',
              label: 'Gradiente (Sobel, Prewitt, Roberts)',
              category: 'espacial',
              math: 'G = \\sqrt{G_x^2 + G_y^2} \\quad \\text{com} \\quad G_x = \\begin{bmatrix} -1 & 0 & 1 \\\\ -2 & 0 & 2 \\\\ -1 & 0 & 1 \\end{bmatrix}',
              details: 'Operador de primeira derivada. Calcula o gradiente espacial de intensidade para detecção direcional de bordas.',
              useCases: [
                'Extração e realce de bordas estruturais de objetos.',
                'Processos de inspeção industrial automatizada para detecção de falhas e fissuras.',
                'Robótica e visão computacional para rastreamento de formas.'
              ],
              simType: 'sobel'
            },
            {
              id: 'filtro-laplaciano',
              label: 'Laplaciano (Segunda Derivada)',
              category: 'espacial',
              math: '\\nabla^2 f = \\frac{\\partial^2 f}{\\partial x^2} + \\frac{\\partial^2 f}{\\partial y^2} \\approx \\begin{bmatrix} 0 & 1 & 0 \\\\ 1 & -4 & 1 \\\\ 0 & 1 & 0 \\end{bmatrix}',
              details: 'Operador isotrópico (independente de direção) de segunda derivada. Destaca transições extremamente finas e rápidas.',
              useCases: [
                'Destacar descontinuidades finas como pontos e linhas isoladas.',
                'Comumente somado/subtraído da imagem original para recuperar a nitidez com o fundo original preservado.',
                'Identificação de microestruturas em exames médicos.'
              ],
              simType: 'laplacian'
            },
            {
              id: 'filtro-unsharp',
              label: 'Mascaramento de Nitidez (Unsharp Mask)',
              category: 'espacial',
              math: 'g(x,y) = f(x,y) + k \\cdot [f(x,y) - \\bar{f}(x,y)]',
              details: 'Subtrai uma versão borrada da própria imagem da imagem original para gerar uma máscara de alta frequência que amplifica as bordas.',
              useCases: [
                'Tradicionalmente utilizado na indústria gráfica e editorial para polir a qualidade de impressão.',
                'Aumento drástico da percepção de nitidez em imagens de satélite e astrofotografia.',
                'Realce estético de texturas fotográficas.'
              ],
              simType: 'unsharp'
            }
          ]
        }
      ]
    },
    {
      id: 'dom-frequencia',
      label: '2. Domínio da Frequência',
      description: 'Filtros aplicados no plano de Fourier, operando sobre as frequências espaciais da imagem.',
      category: 'frequencia',
      children: [
        {
          id: 'freq-suavizacao',
          label: '2.1. Filtros de Suavização (Passa-Baixa)',
          description: 'Atenuam frequências altas no espectro de Fourier, mantendo apenas baixas frequências estruturais.',
          category: 'frequencia',
          children: [
            {
              id: 'filtro-ilpf',
              label: 'Filtro Ideal (ILPF)',
              category: 'frequencia',
              math: 'H(u,v) = \\begin{cases} 1 & \\text{se } D(u,v) \\le D_0 \\\\ 0 & \\text{se } D(u,v) > D_0 \\end{cases}',
              details: 'Corta de forma abrupta todas as frequências acima do limiar estabelecido. Gera forte ruído visual (ringing).',
              useCases: [
                'Fins essencialmente acadêmicos e teóricos.',
                'Demonstração prática do efeito físico de oscilação ("ringing") e reverberação em torno de bordas.'
              ],
              simType: 'ilpf'
            },
            {
              id: 'filtro-blpf',
              label: 'Filtro Butterworth (BLPF)',
              category: 'frequencia',
              math: 'H(u,v) = \\frac{1}{1 + [D(u,v)/D_0]^{2n}}',
              details: 'Filtro de transição suave ajustável de acordo com a ordem do filtro, minimizando as indesejadas ondas de ringing.',
              useCases: [
                'Suavização controlada de ruídos periódicos.',
                'Processamento de imagens médicas onde transições bruscas gerariam falsos diagnósticos.',
                'Borramento industrial paramétrico.'
              ],
              simType: 'blpf'
            },
            {
              id: 'filtro-glpf',
              label: 'Filtro Gaussiano (GLPF)',
              category: 'frequencia',
              math: 'H(u,v) = e^{-D^2(u,v) / 2D_0^2}',
              details: 'Possui curva suave em formato de sino que impede totalmente a geração de oscilações (ringing) ao redor das estruturas.',
              useCases: [
                'União de textos quebrados ou descontinuados em documentos históricos escaneados.',
                'Suavização e correção "cosmética" em retratos fotográficos.',
                'Atenuação de linhas de rastreamento de varredura ("scan lines") de câmeras de sensoriamento orbital.'
              ],
              simType: 'glpf'
            }
          ]
        },
        {
          id: 'freq-agucamento',
          label: '2.2. Filtros de Aguçamento (Passa-Alta)',
          description: 'Atenuam baixas frequências (fundos constantes) e preservam cristas de energia de alta variação.',
          category: 'frequencia',
          children: [
            {
              id: 'filtro-ghpf',
              label: 'Gaussiano Passa-Alta (GHPF)',
              category: 'frequencia',
              math: 'H(u,v) = 1 - e^{-D^2(u,v) / 2D_0^2}',
              details: 'Complementar ao Gaussiano de suavização. Mantém somente as estruturas e variações ultra rápidas da imagem.',
              useCases: [
                'Excelente para detecção de minúcias em impressões digitais, isolando cristas pretas/brancas e limpando borrões de gordura.',
                'Isolamento de fraturas lineares em radiografias.',
                'Alinhamento de peças de manufatura micrométrica.'
              ],
              simType: 'ghpf'
            },
            {
              id: 'filtro-hfe',
              label: 'Ênfase em Altas Frequências',
              category: 'frequencia',
              math: 'H_{HFE}(u,v) = a + b \\cdot H_{HPF}(u,v)',
              details: 'Combina um multiplicador de passa-alta com uma constante de ganho para não apagar por completo as cores originais da imagem.',
              useCases: [
                'Melhoria de imagens médicas de baixo contraste (como raios-X e ultrassons).',
                'Visão noturna de baixo ganho onde se deseja reter a luz ambiente e destacar contornos térmicos.',
                'Realce detalhado de imagens com iluminação opaca.'
              ],
              simType: 'hfe'
            },
            {
              id: 'filtro-homomorfico',
              label: 'Filtro Homomórfico',
              category: 'frequencia',
              math: '\\ln(f) \\to \\text{FFT} \\to H(u,v) \\to \\text{IFFT} \\to e^{g}',
              details: 'Separa componentes de iluminação (frequências muito baixas) da reflectância (frequências altas) usando logaritmo no plano de Fourier.',
              useCases: [
                'Correção de iluminação não uniforme em fotos industriais ou externas.',
                'Compressão simultânea de faixa dinâmica associada a um expressivo aumento de contraste.',
                'Revelação de padrões ocultados por superexposição e clarões em tomografias PET.'
              ],
              simType: 'homomorphic'
            }
          ]
        },
        {
          id: 'freq-seletivos',
          label: '2.3. Filtros Seletivos (Band/Notch)',
          description: 'Filtram zonas e bandas ultra-específicas de frequência para eliminar artefatos geométricos.',
          category: 'frequencia',
          children: [
            {
              id: 'filtro-notch',
              label: 'Filtros Bandreject & Notch',
              category: 'frequencia',
              math: 'H(u,v) = \\prod_{k=1}^M H_k(u,v) \\cdot H_{-k}(u,v)',
              details: 'Bloqueiam cirurgicamente frequências específicas conhecidas e localizadas em pontos pontuais do espectro.',
              useCases: [
                'Isolamento e eliminação completa de interferências periódicas de ruídos eletromagnéticos estruturais.',
                'Remoção de padrões senoidais ou padrão Moire decorrentes do escaneamento de revistas ou jornais antigos.',
                'Limpeza de oscilações indesejadas em imagens orbitais da superfície de corpos celestes.'
              ],
              simType: 'notch'
            }
          ]
        }
      ]
    },
    {
      id: 'dom-morfologia',
      label: '3. Processamento Morfológico',
      description: 'Operações matemáticas baseadas na teoria dos conjuntos e na forma geométrica de elementos estruturantes.',
      category: 'morfologia',
      children: [
        {
          id: 'morf-fundamentais',
          label: '3.1. Operações Morfológicas Fundamentais',
          description: 'Operações básicas que combinam a imagem binária/tons de cinza com um elemento estruturante.',
          category: 'morfologia',
          children: [
            {
              id: 'morf-erosao',
              label: 'Erosão (Erosion)',
              category: 'morfologia',
              math: 'A \\ominus B = \\{z \\mid (B)_z \\subseteq A\\}',
              details: 'Encolhe ou afina os objetos em uma imagem binária. Um pixel da imagem original se torna 0 se o elemento estruturante não couber perfeitamente dentro dele.',
              useCases: [
                'Remover detalhes irrelevantes ou ruídos menores que o elemento estruturante.',
                'Eliminar conexões ou linhas finas indesejadas entre componentes de circuitos impressos.',
                'Isolar objetos maiores e remover artefatos microscópicos em exames laboratoriais.'
              ],
              simType: 'erosion'
            },
            {
              id: 'morf-dilatacao',
              label: 'Dilatação (Dilation)',
              category: 'morfologia',
              math: 'A \\oplus B = \\{z \\mid (\\hat{B})_z \\cap A \\neq \\emptyset\\}',
              details: 'Expande ou engrossa os limites dos objetos. Qualquer pixel que toque o elemento estruturante é ativado na imagem resultante.',
              useCases: [
                'Preencher quebras estreitas ou buracos em contornos inacabados.',
                'Unir fragmentos de caracteres em documentos antigos escaneados em baixa resolução (OCR).',
                'Engrossar bordas para simplificar rastreamento vetorial.'
              ],
              simType: 'dilation'
            },
            {
              id: 'morf-abertura',
              label: 'Abertura (Opening)',
              category: 'morfologia',
              math: 'A \\circ B = (A \\ominus B) \\oplus B',
              details: 'Erosão seguida de uma dilatação usando o mesmo elemento estruturante. Remove saliências e detalhes finos mantendo a forma original.',
              useCases: [
                'Suavizar contornos ásperos ou recortados de objetos.',
                'Quebrar istmos ou conexões finas e eliminar "ilhas" de ruído espúrio.',
                'Limpar ruídos de fundo pontuais em mapas de impressões digitais sem deformar as linhas principais.'
              ],
              simType: 'opening'
            },
            {
              id: 'morf-fechamento',
              label: 'Fechamento (Closing)',
              category: 'morfologia',
              math: 'A \\bullet B = (A \\oplus B) \\ominus B',
              details: 'Dilatação seguida de uma erosão. Fusão de pequenos canais, preenchimento de lacunas internas sem alterar significativamente as áreas.',
              useCases: [
                'Fundir quebras estreitas e rachaduras em estruturas.',
                'Eliminar furos microscópicos de corrosão dentro de áreas de metais estruturais.',
                'Garantir continuidade de formas conectadas em visões de segmentação aérea.'
              ],
              simType: 'closing'
            }
          ]
        },
        {
          id: 'morf-algoritmos',
          label: '3.2. Algoritmos Morfológicos Básicos',
          description: 'Ferramentas estruturais para extrair propriedades geométricas complexas das imagens.',
          category: 'morfologia',
          children: [
            {
              id: 'morf-hit-miss',
              label: 'Hit-or-Miss (Acerto ou Erro)',
              category: 'morfologia',
              math: 'A \\circledast B = (A \\ominus B_1) \\cap (A^c \\ominus B_2)',
              details: 'Detecta padrões ou formas específicas baseado no elemento B1 (acerto) e no elemento complementar B2 (erro).',
              useCases: [
                'Localizar padrões estruturais específicos de pixels em imagens binárias.',
                'Contar o número de cantos ou cruzamentos ortogonais em um mapa de barramentos eletrônicos.'
              ],
              simType: 'hit_miss'
            },
            {
              id: 'morf-fronteiras',
              label: 'Extração de Fronteiras',
              category: 'morfologia',
              math: '\\beta(A) = A - (A \\ominus B)',
              details: 'Subtrai a versão erodida da imagem original para obter exclusivamente a casca/contorno fino de um pixel dos objetos.',
              useCases: [
                'Obter o contorno exato de objetos ou células em análise microscópica.',
                'Vetorização rápida de contornos em sistemas CAD/CAM industriais.'
              ],
              simType: 'boundary'
            },
            {
              id: 'morf-buracos',
              label: 'Preenchimento de Buracos',
              category: 'morfologia',
              math: 'X_k = (X_{k-1} \\oplus B) \\cap A^c',
              details: 'Processo iterativo que utiliza dilatação condicional para preencher bacias fechadas que não tocam o plano de fundo.',
              useCases: [
                'Eliminar reflexos de luz em esferas metálicas polidas.',
                'Preencher regiões vazias criadas por sombras de exames médicos de ultrassonografia.'
              ],
              simType: 'hole_filling'
            },
            {
              id: 'morf-esqueleto',
              label: 'Esqueletização (Skeletons)',
              category: 'morfologia',
              math: 'S(A) = \\bigcup_{k=0}^K S_k(A) \\quad \\text{com} \\quad S_k(A) = (A \\ominus k B) - (A \\ominus k B) \\circ B',
              details: 'Reduz objetos à sua linha central de espessura de 1 pixel, preservando a conectividade e topologia estrutural.',
              useCases: [
                'Representar a topologia de ossos ou vasos sanguíneos para diagnósticos biomédicos.',
                'Reconhecimento de caracteres manuscritos através de sua representação unifilar.'
              ],
              simType: 'skeleton'
            },
            {
              id: 'morf-poda',
              label: 'Poda (Pruning)',
              category: 'morfologia',
              math: 'X_1 = A \\otimes \\{W\\} \\quad X_2 = \\bigcup (X_1 \\oplus H) \\cap A',
              details: 'Pós-processamento de esqueletos para remover pequenos ramos "parasitas" decorrentes de irregularidades nas bordas dos objetos originais.',
              useCases: [
                'Limpeza estrutural após o processo de esqueletização de letras manuscritas.',
                'Refinamento do esqueleto de diagramas unifilares em plantas industriais.'
              ],
              simType: 'pruning'
            }
          ]
        },
        {
          id: 'morf-reconstrucao',
          label: '3.3. Reconstrução e Tons de Cinza',
          description: 'Aplicações avançadas e adaptação morfológica para gradientes de cinza e correções de iluminação.',
          category: 'morfologia',
          children: [
            {
              id: 'morf-recons-abertura',
              label: 'Abertura por Reconstrução',
              category: 'morfologia',
              math: 'R_G^D(F) = \\text{reconstrução por dilatação de } F \\text{ sob } G',
              details: 'Restaura a forma original exata de estruturas volumosas que conseguiram sobreviver a uma erosão rígida de seleção.',
              useCases: [
                'Extrair seletivamente letras ou símbolos que contêm traços longos e retos de documentos históricos.',
                'Isolar grandes artérias em varreduras de ressonância eliminando vasos de menor calibre.'
              ],
              simType: 'reconstruction'
            },
            {
              id: 'morf-bordas',
              label: 'Limpeza de Bordas (Border Clearing)',
              category: 'morfologia',
              math: 'X = F - R_F^D(F_0)',
              details: 'Usa a borda da imagem como semente de reconstrução para identificar e apagar objetos incompletos que tocam a moldura da imagem.',
              useCases: [
                'Eliminar automaticamente células parciais cortadas na borda do slide do microscópio.',
                'Remover artefatos periféricos para evitar erros em sistemas de inspeção por câmeras.'
              ],
              simType: 'border_clear'
            },
            {
              id: 'morf-tophat',
              label: 'Transformação Top-Hat',
              category: 'morfologia',
              math: 'T_{top}(f) = f - (f \\circ b)',
              details: 'Subtrai a abertura morfológica da imagem original em tons de cinza. Destaca regiões muito brilhantes em fundos irregulares ou escuros.',
              useCases: [
                'Corrigir efeitos severos de sombreamento e iluminação não uniforme.',
                'Isolar e segmentar grãos de arroz ou pequenas sementes sobre superfícies com gradientes luminosos complexos.'
              ],
              simType: 'tophat'
            },
            {
              id: 'morf-gradiente',
              label: 'Gradiente Morfológico',
              category: 'morfologia',
              math: 'g = (f \\oplus b) - (f \\ominus b)',
              details: 'Subtração ponto a ponto entre a dilatação e a erosão da imagem, realçando bordas em todas as direções.',
              useCases: [
                'Realce simétrico de fronteiras em exames de raios-X.',
                'Alternativa estável e rápida aos filtros clássicos de primeira derivada para imagens médicas ruidosas.'
              ],
              simType: 'morph_gradient'
            }
          ]
        }
      ]
    },
    {
      id: 'dom-segmentacao',
      label: '4. Segmentação de Imagens',
      description: 'Particionamento da imagem em regiões ou objetos homogêneos baseados em descontinuidades ou similaridade de tons.',
      category: 'segmentacao',
      children: [
        {
          id: 'seg-descontinuidades',
          label: '4.1. Detecção Baseada em Descontinuidades',
          description: 'Localização de pontos onde a variação local de tom é abrupta (bordas, linhas e pontos isolados).',
          category: 'segmentacao',
          children: [
            {
              id: 'seg-pontos',
              label: 'Detecção de Pontos Isolados',
              category: 'segmentacao',
              math: 'R = \\sum w_i z_i \\ge T \\quad \\text{com} \\quad w = \\begin{bmatrix} 1 & 1 & 1 \\\\ 1 & -8 & 1 \\\\ 1 & 1 & 1 \\end{bmatrix}',
              details: 'Usa máscara Laplaciana de alta sensibilidade para destacar pequenos pontos pixelizados cujas intensidades fujam muito do padrão local.',
              useCases: [
                'Detectar microfissuras e minúsculas porosidades em radiografias industriais de solda.',
                'Identificar estrelas distantes de brilho mínimo em astrofotografia de varredura profunda.'
              ],
              simType: 'point_detect'
            },
            {
              id: 'seg-marr-hildreth',
              label: 'Laplaciano do Gaussiano (LoG)',
              category: 'segmentacao',
              math: '\\nabla^2 G = \\left[ \\frac{r^2 - 2\\sigma^2}{\\sigma^4} \\right] e^{-\\frac{r^2}{2\\sigma^2}}',
              details: 'Filtra a imagem com um filtro Gaussiano e em seguida calcula o Laplaciano. Encontra bordas finas através da passagem por zero da derivada.',
              useCases: [
                'Encontrar limites de estruturas com eliminação eficiente de ruídos espúrios.',
                'Geração de contornos fechados em topologias biológicas.'
              ],
              simType: 'marr_hildreth'
            },
            {
              id: 'seg-canny',
              label: 'Detector de Bordas de Canny',
              category: 'segmentacao',
              math: 'G(x,y) \\to \\text{Supressão Não-Máxima} \\to \\text{Limiarização por Histerese}',
              details: 'O detector de contornos mais robusto. Suaviza com Gaussiano, calcula gradientes, aplica supressão não-máxima para afinar linhas e conecta bordas por histerese.',
              useCases: [
                'Extração altamente limpa e precisa de contornos para sistemas de navegação robótica.',
                'Isolamento exato de limites anatômicos (como a calota craniana em tomografias computadorizadas).'
              ],
              simType: 'canny'
            }
          ]
        },
        {
          id: 'seg-limiarizacao',
          label: '4.2. Técnicas de Limiarização (Thresholding)',
          description: 'Separação de canais baseada nas bandas de histogramas para extrair objetos de interesse.',
          category: 'segmentacao',
          children: [
            {
              id: 'seg-otsu',
              label: 'Método de Otsu (Global Ótimo)',
              category: 'segmentacao',
              math: '\\sigma^2_B(k^*) = \\max_{1 \\le k < L} \\frac{[m_G P_1(k) - m(k)]^2}{P_1(k)[1 - P_1(k)]}',
              details: 'Calcula automaticamente o limite ideal que maximiza a variância entre as classes (objeto e fundo), baseando-se no histograma.',
              useCases: [
                'Binarização de alta precisão de documentos impressos bem iluminados.',
                'Isolamento automático de materiais biológicos (como células ou leveduras) contra o fundo de lâminas ópticas.'
              ],
              simType: 'otsu'
            },
            {
              id: 'seg-local-adapt',
              label: 'Limiarização Local Adaptativa',
              category: 'segmentacao',
              math: 'T(x,y) = m_{local}(x,y) - K',
              details: 'Calcula um limiar dinâmico para cada pixel com base na média ou mediana de sua vizinhança local.',
              useCases: [
                'Recuperar textos e assinaturas em cheques ou notas rasuradas ou sob sombras.',
                'Tratamento e segmentação de fotos com problemas críticos de iluminação direcional ou reflexo de flashes.'
              ],
              simType: 'local_adaptive_thresh'
            }
          ]
        },
        {
          id: 'seg-regioes',
          label: '4.3. Segmentação Baseada em Regiões e Divisor',
          description: 'Agrupamento direto de pixels com base em conectividade, semelhança e comportamento de fluxo.',
          category: 'segmentacao',
          children: [
            {
              id: 'seg-region-growing',
              label: 'Crescimento de Regiões (Region Growing)',
              category: 'segmentacao',
              math: 'P(R) \\implies \\text{Adicionar vizinhos se } |f(x,y) - m_{seed}| \\le T',
              details: 'Inicia a partir de pontos predeterminados chamados sementes e cresce agregando pixels vizinhos que compartilham propriedades semelhantes.',
              useCases: [
                'Mapeamento de rachaduras ou vazamentos contínuos em processos industriais estruturais.',
                'Isolamento de tumores ou anomalias cerebrais em ressonâncias magnéticas a partir de uma semente marcada pelo médico.'
              ],
              simType: 'region_growing'
            },
            {
              id: 'seg-watershed',
              label: 'Divisor de Águas (Watershed)',
              category: 'segmentacao',
              math: 'g(x,y) = \\text{Bacias de Atração de } |\\nabla f|',
              details: 'Interpreta a imagem ou seu gradiente como uma topologia física de vales e colinas, inundando a imagem a partir de mínimos para criar barreiras de contenção (represas) nas linhas divisorias.',
              useCases: [
                'Separar múltiplos objetos circulares sobrepostos, como grãos de polen, moedas ou células aglomeradas.',
                'Controle de contornos exatos em biomicroscopia celular de alta densidade.'
              ],
              simType: 'watershed'
            }
          ]
        }
      ]
    },
    {
      id: 'dom-restauracao',
      label: '5. Restauração Avançada',
      description: 'Modelos e abordagens matemáticas para compensar e recuperar imagens que sofreram degradação conhecida ou severa.',
      category: 'restauracao',
      children: [
        {
          id: 'rest-estatistica',
          label: '5.1. Média e Estatística para Ruídos Complexos',
          description: 'Estatísticas de ordem refinadas para resolver problemas onde ruídos clássicos falham.',
          category: 'restauracao',
          children: [
            {
              id: 'filtro-media-geom',
              label: 'Média Geométrica',
              category: 'restauracao',
              math: 'g(x,y) = \\left[ \\prod_{(s,t) \\in S_{xy}} f(s,t) \\right]^{\\frac{1}{m \\cdot n}}',
              details: 'Filtro multiplicativo. Preserva e retém de forma superior detalhes estruturais delicados se comparado à média aritmética.',
              useCases: [
                'Filtragem com menor perda de bordas e contornos finos.',
                'Ideal para tratar imagens com ruído Gaussiano e uniforme aditivo.'
              ],
              simType: 'geom_mean'
            },
            {
              id: 'filtro-contraharmonico',
              label: 'Média Contraharmônica',
              category: 'restauracao',
              math: 'g(x,y) = \\frac{\\sum f(s,t)^{Q+1}}{\\sum f(s,t)^Q}',
              details: 'Filtro especializado parametrizado pela potência Q. Perfeito para selecionar eliminação focada.',
              useCases: [
                'Com Q > 0: Elimina perfeitamente ruído "Pimenta" (pontos escuros).',
                'Com Q < 0: Elimina perfeitamente ruído "Sal" (pontos brancos).',
                'Falha se ambos os ruídos estiverem presentes em simultâneo.'
              ],
              simType: 'contraharmonic'
            }
          ]
        }
      ]
    }
  ]
};

// Flatten data para busca
const flattenNodes = (node, parent = null) => {
  let list = [{ ...node, parentId: parent?.id }];
  if (node.children) {
    node.children.forEach(child => {
      list = [...list, ...flattenNodes(child, node)];
    });
  }
  return list;
};

const allNodes = flattenNodes(filterData);

export default function App() {
  const [selectedNode, setSelectedNode] = useState(allNodes.find(n => n.id === 'morf-abertura'));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedNodes, setExpandedNodes] = useState({
    'root': true,
    'dom-espacial': true,
    'esp-suavizacao': false,
    'esp-agucamento': false,
    'dom-frequencia': false,
    'dom-morfologia': true,
    'morf-fundamentais': true,
    'morf-algoritmos': false,
    'morf-reconstrucao': false,
    'dom-segmentacao': true,
    'seg-descontinuidades': false,
    'seg-limiarizacao': true,
    'seg-regioes': false,
    'dom-restauracao': false,
  });

  // Estados do Simulador
  const [noiseLevel, setNoiseLevel] = useState(0.2);
  const [noiseType, setNoiseType] = useState('salt_pepper');
  const [filterStrength, setFilterStrength] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState('canvas');

  const sourceCanvasRef = useRef(null);
  const degradedCanvasRef = useRef(null);
  const resultCanvasRef = useRef(null);

  // Toggle expand/collapse
  const toggleNode = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectNode = (node) => {
    if (!node.children) {
      setSelectedNode(node);
      
      // Auto-configuração inteligente do tipo de ruído conforme o filtro selecionado para melhor demonstração pedagógica
      if (node.category === 'morfologia') {
        setNoiseType('salt_pepper');
        setNoiseLevel(0.12);
      } else if (node.id === 'seg-otsu' || node.id === 'seg-local-adapt') {
        setNoiseType('gaussian');
        setNoiseLevel(0.35); // Altos gradientes de cinza para forçar o limite
      } else if (node.category === 'segmentacao') {
        setNoiseType('gaussian');
        setNoiseLevel(0.15);
      } else {
        setNoiseType('salt_pepper');
        setNoiseLevel(0.15);
      }
    } else {
      toggleNode(node.id);
    }
  };

  // --- DESENHAR IMAGEM VETORIAL ORIGINAL ---
  const drawOriginalImage = (ctx, width, height) => {
    ctx.fillStyle = '#0f172a'; // Fundo escuro profundo
    ctx.fillRect(0, 0, width, height);

    // Estrutura circular (Anel)
    ctx.strokeStyle = '#38bdf8'; // Ciano
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 15, 55, 0, Math.PI * 2);
    ctx.stroke();

    // Núcleo central sólido
    ctx.fillStyle = '#f43f5e'; // Rosa
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 15, 22, 0, Math.PI * 2);
    ctx.fill();

    // Barra retangular inferior
    ctx.fillStyle = '#fbbf24'; // Amarelo
    ctx.fillRect(width / 2 - 65, height / 2 + 45, 130, 20);

    // Grelha de calibração sutil ao fundo (meia opacidade)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 15; i < width; i += 30) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    // Texto de alta legibilidade
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VISION LAB', width / 2, height - 15);
  };

  // --- ALGORITMOS DE DEGRADAÇÃO / ADIÇÃO DE RUÍDO ---
  const applyDegradation = (srcCtx, destCtx, width, height, type, amount) => {
    const imgData = srcCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    if (type === 'salt_pepper') {
      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < amount) {
          const val = Math.random() < 0.5 ? 0 : 255;
          data[i] = val;     // R
          data[i + 1] = val; // G
          data[i + 2] = val; // B
        }
      }
    } else if (type === 'gaussian') {
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * amount * 255;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
    } else if (type === 'motion_blur') {
      const tempImg = srcCtx.getImageData(0, 0, width, height);
      const temp = tempImg.data;
      const blurDistance = Math.floor(amount * 15) + 2;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let r = 0, g = 0, b = 0, count = 0;
          for (let d = 0; d < blurDistance; d++) {
            const nx = x + d;
            if (nx < width) {
              const idx = (y * width + nx) * 4;
              r += temp[idx];
              g += temp[idx + 1];
              b += temp[idx + 2];
              count++;
            }
          }
          const outIdx = (y * width + x) * 4;
          data[outIdx] = r / count;
          data[outIdx + 1] = g / count;
          data[outIdx + 2] = b / count;
        }
      }
    }
    destCtx.putImageData(imgData, 0, 0);
  };

  // --- PIPELINE OPERACIONAL DE FILTRAGEM, MORFOLOGIA E SEGMENTAÇÃO ---
  const applyFilter = (degradedCtx, targetCtx, width, height, filterType, size) => {
    const srcData = degradedCtx.getImageData(0, 0, width, height);
    const destData = targetCtx.createImageData(width, height);
    const src = srcData.data;
    const dest = destData.data;

    const kSize = size;
    const half = Math.floor(kSize / 2);

    // Iniciar canal alfa completo
    for (let i = 3; i < src.length; i += 4) dest[i] = 255;

    // --- FUNÇÕES AUXILIARES DE COPIA ---
    const copyToDest = (sourceArray, destArray) => {
      for(let i=0; i<sourceArray.length; i++) {
        if (i % 4 !== 3) destArray[i] = sourceArray[i];
      }
    };

    // Converter para escala de cinza (muito útil para morfologia e segmentação estruturada)
    const getGrayscaleVal = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

    // --- EXECUÇÃO DOS ALGORITMOS ---
    if (filterType === 'blur') {
      // Filtro de Média
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let r = 0, g = 0, b = 0, count = 0;
          for (let ky = -half; ky <= half; ky++) {
            for (let kx = -half; kx <= half; kx++) {
              const px = Math.min(width - 1, Math.max(0, x + kx));
              const py = Math.min(height - 1, Math.max(0, y + ky));
              const idx = (py * width + px) * 4;
              r += src[idx]; g += src[idx + 1]; b += src[idx + 2];
              count++;
            }
          }
          const outIdx = (y * width + x) * 4;
          dest[outIdx] = r / count; dest[outIdx + 1] = g / count; dest[outIdx + 2] = b / count;
        }
      }
    } else if (filterType === 'median') {
      // Filtro de Mediana
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const rVals = [], gVals = [], bVals = [];
          for (let ky = -half; ky <= half; ky++) {
            for (let kx = -half; kx <= half; kx++) {
              const px = Math.min(width - 1, Math.max(0, x + kx));
              const py = Math.min(height - 1, Math.max(0, y + ky));
              const idx = (py * width + px) * 4;
              rVals.push(src[idx]); gVals.push(src[idx + 1]); bVals.push(src[idx + 2]);
            }
          }
          rVals.sort((a, b) => a - b);
          gVals.sort((a, b) => a - b);
          bVals.sort((a, b) => a - b);
          const mid = Math.floor(rVals.length / 2);
          const outIdx = (y * width + x) * 4;
          dest[outIdx] = rVals[mid]; dest[outIdx + 1] = gVals[mid]; dest[outIdx + 2] = bVals[mid];
        }
      }
    } else if (filterType === 'sobel') {
      // Sobel Edge
      const mx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
      const my = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let rx = 0, ry = 0, gx = 0, gy = 0, bx = 0, by = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4;
              const wx = mx[ky + 1][kx + 1];
              const wy = my[ky + 1][kx + 1];
              rx += src[idx] * wx; ry += src[idx] * wy;
              gx += src[idx + 1] * wx; gy += src[idx + 1] * wy;
              bx += src[idx + 2] * wx; by += src[idx + 2] * wy;
            }
          }
          const outIdx = (y * width + x) * 4;
          dest[outIdx] = Math.sqrt(rx * rx + ry * ry);
          dest[outIdx + 1] = Math.sqrt(gx * gx + gy * gy);
          dest[outIdx + 2] = Math.sqrt(bx * bx + by * by);
        }
      }
    } else if (filterType === 'laplacian') {
      const lKernel = [[0, 1, 0], [1, -4, 1], [0, 1, 0]];
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let r = 0, g = 0, b = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4;
              const w = lKernel[ky + 1][kx + 1];
              r += src[idx] * w; g += src[idx + 1] * w; b += src[idx + 2] * w;
            }
          }
          const outIdx = (y * width + x) * 4;
          dest[outIdx] = Math.min(255, Math.max(0, src[outIdx] - r * 1.5));
          dest[outIdx + 1] = Math.min(255, Math.max(0, src[outIdx + 1] - g * 1.5));
          dest[outIdx + 2] = Math.min(255, Math.max(0, src[outIdx + 2] - b * 1.5));
        }
      }
    } else if (filterType === 'unsharp') {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const px = Math.min(width - 1, Math.max(0, x + kx));
              const py = Math.min(height - 1, Math.max(0, y + ky));
              const idx = (py * width + px) * 4;
              sumR += src[idx]; sumG += src[idx + 1]; sumB += src[idx + 2];
              count++;
            }
          }
          const outIdx = (y * width + x) * 4;
          const blurredR = sumR / count;
          const blurredG = sumG / count;
          const blurredB = sumB / count;
          const maskR = src[outIdx] - blurredR;
          const maskG = src[outIdx + 1] - blurredG;
          const maskB = src[outIdx + 2] - blurredB;
          const k = 1.8;
          dest[outIdx] = Math.min(255, Math.max(0, src[outIdx] + k * maskR));
          dest[outIdx + 1] = Math.min(255, Math.max(0, src[outIdx + 1] + k * maskG));
          dest[outIdx + 2] = Math.min(255, Math.max(0, src[outIdx + 2] + k * maskB));
        }
      }
    } else if (filterType === 'ilpf' || filterType === 'blpf' || filterType === 'glpf' || filterType === 'ghpf' || filterType === 'hfe' || filterType === 'homomorphic') {
      // --- FREQUENCY DOMAIN EMULATORS ---
      const isPassHigh = filterType === 'ghpf' || filterType === 'hfe' || filterType === 'homomorphic';
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const outIdx = (y * width + x) * 4;
          const dx = x - width / 2;
          const dy = y - height / 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let hFactor = 1.0;
          const d0 = 35;

          if (filterType === 'ilpf') {
            hFactor = dist <= d0 ? 1.0 : 0.05;
          } else if (filterType === 'blpf') {
            hFactor = 1 / (1 + Math.pow(dist / d0, 4));
          } else if (filterType === 'glpf') {
            hFactor = Math.exp(-(dist * dist) / (2 * d0 * d0));
          } else if (filterType === 'ghpf') {
            hFactor = 1.0 - Math.exp(-(dist * dist) / (2 * d0 * d0));
          } else if (filterType === 'hfe') {
            const ghpf = 1.0 - Math.exp(-(dist * dist) / (2 * d0 * d0));
            hFactor = 0.5 + 1.2 * ghpf;
          } else if (filterType === 'homomorphic') {
            const ghpf = 1.0 - Math.exp(-(dist * dist) / (2 * (d0 * 1.5) * (d0 * 1.5)));
            hFactor = 0.4 + 1.5 * ghpf;
          }

          if (isPassHigh) {
            const rOrig = src[outIdx]; const gOrig = src[outIdx + 1]; const bOrig = src[outIdx + 2];
            const edgeR = Math.abs(rOrig - (src[Math.max(0, outIdx - 4)] || rOrig));
            const edgeG = Math.abs(gOrig - (src[Math.max(0, outIdx - 4)] || gOrig));
            const edgeB = Math.abs(bOrig - (src[Math.max(0, outIdx - 4)] || bOrig));

            if (filterType === 'ghpf') {
              dest[outIdx] = edgeR * hFactor * 4;
              dest[outIdx + 1] = edgeG * hFactor * 4;
              dest[outIdx + 2] = edgeB * hFactor * 4;
            } else {
              dest[outIdx] = Math.min(255, (rOrig * 0.4) + edgeR * hFactor * 2.5);
              dest[outIdx + 1] = Math.min(255, (gOrig * 0.4) + edgeG * hFactor * 2.5);
              dest[outIdx + 2] = Math.min(255, (bOrig * 0.4) + edgeB * hFactor * 2.5);
            }
          } else {
            const ring = filterType === 'ilpf' ? Math.sin(dist / 3) * 15 : 0;
            let sumR = 0, sumG = 0, sumB = 0, count = 0;
            const blurWindow = filterType === 'glpf' ? 3 : 2;
            for (let ky = -blurWindow; ky <= blurWindow; ky++) {
              for (let kx = -blurWindow; kx <= blurWindow; kx++) {
                const px = Math.min(width - 1, Math.max(0, x + kx));
                const py = Math.min(height - 1, Math.max(0, y + ky));
                const idx = (py * width + px) * 4;
                sumR += src[idx]; sumG += src[idx+1]; sumB += src[idx+2];
                count++;
              }
            }
            const blurR = sumR / count; const blurG = sumG / count; const blurB = sumB / count;
            dest[outIdx] = Math.min(255, Math.max(0, (src[outIdx] * (1 - hFactor) + blurR * hFactor) + ring));
            dest[outIdx + 1] = Math.min(255, Math.max(0, (src[outIdx+1] * (1 - hFactor) + blurG * hFactor) + ring));
            dest[outIdx + 2] = Math.min(255, Math.max(0, (src[outIdx+2] * (1 - hFactor) + blurB * hFactor) + ring));
          }
        }
      }
    } else if (filterType === 'notch') {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const outIdx = (y * width + x) * 4;
          if (y % 4 === 0) {
            const prevIdx = (Math.max(0, y - 1) * width + x) * 4;
            const nextIdx = (Math.min(height - 1, y + 1) * width + x) * 4;
            dest[outIdx] = (src[prevIdx] + src[nextIdx]) / 2;
            dest[outIdx + 1] = (src[prevIdx + 1] + src[nextIdx + 1]) / 2;
            dest[outIdx + 2] = (src[prevIdx + 2] + src[nextIdx + 2]) / 2;
          } else {
            dest[outIdx] = src[outIdx]; dest[outIdx + 1] = src[outIdx + 1]; dest[outIdx + 2] = src[outIdx + 2];
          }
        }
      }
    }

    // --- NOVO: PROCESSAMENTO MORFOLÓGICO REAL (EROSÃO, DILATAÇÃO, ABERTURA, ETC) ---
    else if (filterType === 'erosion' || filterType === 'dilation' || filterType === 'opening' || filterType === 'closing' || filterType === 'boundary' || filterType === 'tophat' || filterType === 'morph_gradient') {
      
      // Binarização local inicial para melhor visualização morfológica limpa
      const binarySrc = new Uint8Array(width * height);
      for(let i=0; i < src.length; i += 4) {
        const gray = getGrayscaleVal(src[i], src[i+1], src[i+2]);
        binarySrc[i/4] = gray > 100 ? 255 : 0;
      }

      const erosionFn = (input, output) => {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let minVal = 255;
            for (let ky = -half; ky <= half; ky++) {
              for (let kx = -half; kx <= half; kx++) {
                const px = Math.min(width - 1, Math.max(0, x + kx));
                const py = Math.min(height - 1, Math.max(0, y + ky));
                minVal = Math.min(minVal, input[py * width + px]);
              }
            }
            output[y * width + x] = minVal;
          }
        }
      };

      const dilationFn = (input, output) => {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let maxVal = 0;
            for (let ky = -half; ky <= half; ky++) {
              for (let kx = -half; kx <= half; kx++) {
                const px = Math.min(width - 1, Math.max(0, x + kx));
                const py = Math.min(height - 1, Math.max(0, y + ky));
                maxVal = Math.max(maxVal, input[py * width + px]);
              }
            }
            output[y * width + x] = maxVal;
          }
        }
      };

      const eroded = new Uint8Array(width * height);
      const dilated = new Uint8Array(width * height);
      const tempBuffer = new Uint8Array(width * height);

      if (filterType === 'erosion') {
        erosionFn(binarySrc, eroded);
        for(let i=0; i<eroded.length; i++) {
          const outIdx = i * 4;
          dest[outIdx] = dest[outIdx+1] = dest[outIdx+2] = eroded[i];
        }
      } else if (filterType === 'dilation') {
        dilationFn(binarySrc, dilated);
        for(let i=0; i<dilated.length; i++) {
          const outIdx = i * 4;
          dest[outIdx] = dest[outIdx+1] = dest[outIdx+2] = dilated[i];
        }
      } else if (filterType === 'opening') {
        erosionFn(binarySrc, tempBuffer);
        dilationFn(tempBuffer, dilated);
        for(let i=0; i<dilated.length; i++) {
          const outIdx = i * 4;
          dest[outIdx] = dest[outIdx+1] = dest[outIdx+2] = dilated[i];
        }
      } else if (filterType === 'closing') {
        dilationFn(binarySrc, tempBuffer);
        erosionFn(tempBuffer, eroded);
        for(let i=0; i<eroded.length; i++) {
          const outIdx = i * 4;
          dest[outIdx] = dest[outIdx+1] = dest[outIdx+2] = eroded[i];
        }
      } else if (filterType === 'boundary') {
        // Fronteira: Original - Erodido
        erosionFn(binarySrc, eroded);
        for(let i=0; i<eroded.length; i++) {
          const outIdx = i * 4;
          const val = binarySrc[i] - eroded[i] > 0 ? 255 : 0;
          dest[outIdx] = dest[outIdx+1] = dest[outIdx+2] = val;
          if (val > 0) { // Colorindo a borda para ficar visualmente impactante!
            dest[outIdx] = 244; dest[outIdx+1] = 63; dest[outIdx+2] = 94; // Rosa chiclete
          }
        }
      } else if (filterType === 'tophat') {
        // Top-Hat: Original - Abertura
        erosionFn(binarySrc, tempBuffer);
        dilationFn(tempBuffer, dilated);
        for(let i=0; i<dilated.length; i++) {
          const outIdx = i * 4;
          const val = Math.max(0, binarySrc[i] - dilated[i]);
          dest[outIdx] = dest[outIdx+1] = dest[outIdx+2] = val;
        }
      } else if (filterType === 'morph_gradient') {
        // Gradiente Morfológico: Dilatação - Erosão
        dilationFn(binarySrc, dilated);
        erosionFn(binarySrc, eroded);
        for(let i=0; i<eroded.length; i++) {
          const outIdx = i * 4;
          const val = dilated[i] - eroded[i];
          dest[outIdx] = 56; dest[outIdx+1] = 189; dest[outIdx+2] = 248; // Azul Ciano nas bordas
        }
      }
    }

    // --- NOVO: OPERAÇÕES DE SEGMENTAÇÃO DE IMAGENS ---
    else if (filterType === 'otsu' || filterType === 'local_adaptive_thresh' || filterType === 'point_detect' || filterType === 'canny' || filterType === 'marr_hildreth' || filterType === 'region_growing' || filterType === 'watershed') {
      
      const grayImg = new Uint8Array(width * height);
      for(let i=0; i < src.length; i += 4) {
        grayImg[i/4] = getGrayscaleVal(src[i], src[i+1], src[i+2]);
      }

      if (filterType === 'otsu') {
        // Algoritmo de Otsu Global Automático
        const histogram = new Int32Array(256);
        for (let i = 0; i < grayImg.length; i++) {
          histogram[grayImg[i]]++;
        }

        let total = grayImg.length;
        let sum = 0;
        for (let t = 0; t < 256; t++) sum += t * histogram[t];

        let sumB = 0;
        let wB = 0;
        let wF = 0;
        let varMax = 0;
        let threshold = 0;

        for (let t = 0; t < 256; t++) {
          wB += histogram[t];
          if (wB === 0) continue;
          wF = total - wB;
          if (wF === 0) break;

          sumB += t * histogram[t];
          let mB = sumB / wB;
          let mF = (sum - sumB) / wF;

          // Variância entre-classes
          let varBetween = wB * wF * (mB - mF) * (mB - mF);
          if (varBetween > varMax) {
            varMax = varBetween;
            threshold = t;
          }
        }

        // Binarizar baseado no limite ótimo calculado
        for(let i=0; i<grayImg.length; i++) {
          const outIdx = i * 4;
          const binaryVal = grayImg[i] >= threshold ? 255 : 0;
          dest[outIdx] = dest[outIdx+1] = dest[outIdx+2] = binaryVal;
        }

      } else if (filterType === 'local_adaptive_thresh') {
        // Limiarização adaptativa local (Média Local - K)
        const K = 8;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            let sum = 0, count = 0;
            for (let ky = -2; ky <= 2; ky++) {
              for (let kx = -2; kx <= 2; kx++) {
                const px = Math.min(width - 1, Math.max(0, x + kx));
                const py = Math.min(height - 1, Math.max(0, y + ky));
                sum += grayImg[py * width + px];
                count++;
              }
            }
            const localMean = sum / count;
            const outIdx = (y * width + x) * 4;
            const val = grayImg[y * width + x] >= (localMean - K) ? 255 : 0;
            dest[outIdx] = dest[outIdx+1] = dest[outIdx+2] = val;
          }
        }
      } else if (filterType === 'point_detect') {
        // Detecção de pontos usando Máscara de alta variação isolada
        const mask = [[1, 1, 1], [1, -8, 1], [1, 1, 1]];
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            let sum = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                sum += grayImg[(y + ky) * width + (x + kx)] * mask[ky + 1][kx + 1];
              }
            }
            const outIdx = (y * width + x) * 4;
            const val = Math.abs(sum) > 120 ? 255 : 0;
            dest[outIdx] = 251; dest[outIdx+1] = 191; dest[outIdx+2] = 36; // Pontos brilhantes em dourado
          }
        }
      } else if (filterType === 'marr_hildreth') {
        // Laplaciano do Gaussiano (LoG)
        const logKernel = [
          [0, 0, 1, 0, 0],
          [0, 1, 2, 1, 0],
          [1, 2, -16, 2, 1],
          [0, 1, 2, 1, 0],
          [0, 0, 1, 0, 0]
        ];
        for (let y = 2; y < height - 2; y++) {
          for (let x = 2; x < width - 2; x++) {
            let sum = 0;
            for (let ky = -2; ky <= 2; ky++) {
              for (let kx = -2; kx <= 2; kx++) {
                sum += grayImg[(y + ky) * width + (x + kx)] * logKernel[ky + 2][kx + 2];
              }
            }
            const outIdx = (y * width + x) * 4;
            // Detecção de cruzamento por zero simplificado para visualização de bordas de 1 pixel
            const val = Math.abs(sum) > 80 ? 255 : 0;
            dest[outIdx] = dest[outIdx+1] = dest[outIdx+2] = val;
          }
        }
      } else if (filterType === 'canny') {
        // Canny simplificado (Gradiente robusto + afinamento não-máximo)
        const dx = new Float32Array(width * height);
        const dy = new Float32Array(width * height);
        const mag = new Float32Array(width * height);

        // Gradiente de Sobel para magnitude de Canny
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const gx = -grayImg[(y-1)*width + x-1] + grayImg[(y-1)*width + x+1]
                       -2*grayImg[y*width + x-1] + 2*grayImg[y*width + x+1]
                       -grayImg[(y+1)*width + x-1] + grayImg[(y+1)*width + x+1];
            
            const gy = -grayImg[(y-1)*width + x-1] - 2*grayImg[(y-1)*width + x] - grayImg[(y-1)*width + x+1]
                       +grayImg[(y+1)*width + x-1] + 2*grayImg[(y+1)*width + x] + grayImg[(y+1)*width + x+1];
            dx[idx] = gx;
            dy[idx] = gy;
            mag[idx] = Math.sqrt(gx*gx + gy*gy);
          }
        }

        // Supressão não-máxima (Afinamento das bordas)
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const outIdx = idx * 4;
            let mVal = mag[idx];

            if (mVal > 50) { // Limiarização por histerese simplificada
              let angle = Math.atan2(dy[idx], dx[idx]) * (180 / Math.PI);
              if (angle < 0) angle += 180;

              let neighbor1 = 0, neighbor2 = 0;
              if ((angle >= 0 && angle < 22.5) || (angle >= 157.5 && angle <= 180)) {
                neighbor1 = mag[idx - 1]; neighbor2 = mag[idx + 1];
              } else if (angle >= 22.5 && angle < 67.5) {
                neighbor1 = mag[idx - width - 1]; neighbor2 = mag[idx + width + 1];
              } else if (angle >= 67.5 && angle < 112.5) {
                neighbor1 = mag[idx - width]; neighbor2 = mag[idx + width];
              } else {
                neighbor1 = mag[idx - width + 1]; neighbor2 = mag[idx + width - 1];
              }

              if (mVal >= neighbor1 && mVal >= neighbor2) {
                dest[outIdx] = dest[outIdx+1] = dest[outIdx+2] = 255; // Borda ultra-fina ativada
              }
            }
          }
        }
      } else if (filterType === 'region_growing') {
        // Simulador de Crescimento de Regiões baseado em semente geométrica (centro)
        const seedX = Math.floor(width / 2);
        const seedY = Math.floor(height / 2) - 15;
        const seedVal = grayImg[seedY * width + seedX];
        const threshold = 35;

        const visited = new Uint8Array(width * height);
        const queue = [[seedX, seedY]];
        visited[seedY * width + seedX] = 1;

        while (queue.length > 0) {
          const [cx, cy] = queue.shift();
          const cIdx = cy * width + cx;
          const outIdx = cIdx * 4;

          // Destaca a região crescendo em vermelho/rosa
          dest[outIdx] = 244; dest[outIdx+1] = 63; dest[outIdx+2] = 94;

          const neighbors = [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]];
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (!visited[nIdx]) {
                const diff = Math.abs(grayImg[nIdx] - seedVal);
                if (diff <= threshold) {
                  visited[nIdx] = 1;
                  queue.push([nx, ny]);
                }
              }
            }
          }
        }

        // Mistura os pixels não segmentados com transparência sutil
        for(let i=0; i<grayImg.length; i++) {
          if(!visited[i]) {
            const outIdx = i * 4;
            dest[outIdx] = src[outIdx] * 0.4;
            dest[outIdx+1] = src[outIdx+1] * 0.4;
            dest[outIdx+2] = src[outIdx+2] * 0.4;
          }
        }
      } else if (filterType === 'watershed') {
        // Divisor de águas: Segmenta o anel e o centro em bacias de inundação distintas
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const outIdx = idx * 4;
            const distCenter = Math.sqrt((x - width/2)*(x - width/2) + (y - (height/2-15))*(y - (height/2-15)));

            if (distCenter < 30) {
              // Bacia de Atração 1 (Núcleo) - Colorido em Verde Água
              dest[outIdx] = 45; dest[outIdx+1] = 212; dest[outIdx+2] = 191;
            } else if (distCenter >= 40 && distCenter <= 70) {
              // Bacia de Atração 2 (Anel) - Colorido em Indigo profundo
              dest[outIdx] = 99; dest[outIdx+1] = 102; dest[outIdx+2] = 241;
            } else if (distCenter > 70 && distCenter < 100) {
              // Bacia externa de isolamento - Colorido em Amarelo Sol
              dest[outIdx] = 251; dest[outIdx+1] = 191; dest[outIdx+2] = 36;
            } else {
              // Divisórias topológicas (Linhas de represa do Watershed) - Brancas completas
              dest[outIdx] = dest[outIdx+1] = dest[outIdx+2] = 255;
            }
          }
        }
      }
    }

    // --- RESTAURAÇÃO AVANÇADA (CASOS DO PROJETO ANTERIOR) ---
    else if (filterType === 'geom_mean') {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let prodR = 1, prodG = 1, prodB = 1, count = 0;
          for (let ky = -half; ky <= half; ky++) {
            for (let kx = -half; kx <= half; kx++) {
              const px = Math.min(width - 1, Math.max(0, x + kx));
              const py = Math.min(height - 1, Math.max(0, y + ky));
              const idx = (py * width + px) * 4;
              prodR *= (src[idx] + 1); prodG *= (src[idx + 1] + 1); prodB *= (src[idx + 2] + 1);
              count++;
            }
          }
          const outIdx = (y * width + x) * 4;
          dest[outIdx] = Math.pow(prodR, 1 / count) - 1;
          dest[outIdx + 1] = Math.pow(prodG, 1 / count) - 1;
          dest[outIdx + 2] = Math.pow(prodB, 1 / count) - 1;
        }
      }
    } else if (filterType === 'contraharmonic') {
      const Q = 1.5;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let numR = 0, denR = 0, numG = 0, denG = 0, numB = 0, denB = 0;
          for (let ky = -half; ky <= half; ky++) {
            for (let kx = -half; kx <= half; kx++) {
              const px = Math.min(width - 1, Math.max(0, x + kx));
              const py = Math.min(height - 1, Math.max(0, y + ky));
              const idx = (py * width + px) * 4;

              const vr = src[idx] + 0.1; const vg = src[idx+1] + 0.1; const vb = src[idx+2] + 0.1;
              numR += Math.pow(vr, Q + 1); denR += Math.pow(vr, Q);
              numG += Math.pow(vg, Q + 1); denG += Math.pow(vg, Q);
              numB += Math.pow(vb, Q + 1); denB += Math.pow(vb, Q);
            }
          }
          const outIdx = (y * width + x) * 4;
          dest[outIdx] = denR !== 0 ? numR / denR : 0;
          dest[outIdx + 1] = denG !== 0 ? numG / denG : 0;
          dest[outIdx + 2] = denB !== 0 ? numB / denB : 0;
        }
      }
    } else {
      // Direct copy fallback
      for (let i = 0; i < src.length; i++) dest[i] = src[i];
    }

    targetCtx.putImageData(destData, 0, 0);
  };

  // --- LOOP E RE-RENDERIZAÇÃO DO SIMULADOR ---
  const runSimulation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const srcCanvas = sourceCanvasRef.current;
      const degCanvas = degradedCanvasRef.current;
      const resCanvas = resultCanvasRef.current;

      if (!srcCanvas || !degCanvas || !resCanvas) {
        setIsProcessing(false);
        return;
      }

      const srcCtx = srcCanvas.getContext('2d');
      const degCtx = degCanvas.getContext('2d');
      const resCtx = resCanvas.getContext('2d');

      const w = srcCanvas.width;
      const h = srcCanvas.height;

      // Desenhar base vetorial pura
      drawOriginalImage(srcCtx, w, h);

      // Injetar o canal de poluição/ruído
      applyDegradation(srcCtx, degCtx, w, h, noiseType, noiseLevel);

      // Computar as matrizes de filtragem, morfologia ou segmentação de forma local
      const selectedSimType = selectedNode?.simType || 'blur';
      applyFilter(degCtx, resCtx, w, h, selectedSimType, filterStrength);

      setIsProcessing(false);
    }, 120);
  };

  useEffect(() => {
    runSimulation();
  }, [selectedNode, noiseType, noiseLevel, filterStrength]);

  const filteredNodes = allNodes.filter(node => {
    const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          node.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          node.details?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && node.category === activeTab;
  });

  const renderMindMapBranch = (node) => {
    const isExpanded = expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;

    let categoryBorder = 'border-slate-800 hover:border-slate-500';
    let activeBg = 'bg-slate-800 text-white';

    if (node.category === 'espacial') {
      categoryBorder = 'border-emerald-950/40 hover:border-emerald-500';
      activeBg = 'bg-emerald-950/80 text-emerald-200 border-emerald-500';
    } else if (node.category === 'frequencia') {
      categoryBorder = 'border-indigo-950/40 hover:border-indigo-500';
      activeBg = 'bg-indigo-950/80 text-indigo-200 border-indigo-500';
    } else if (node.category === 'morfologia') {
      categoryBorder = 'border-pink-950/40 hover:border-pink-500';
      activeBg = 'bg-pink-950/80 text-pink-200 border-pink-500';
    } else if (node.category === 'segmentacao') {
      categoryBorder = 'border-amber-950/40 hover:border-amber-500';
      activeBg = 'bg-amber-950/80 text-amber-200 border-amber-500';
    } else if (node.category === 'restauracao') {
      categoryBorder = 'border-cyan-950/40 hover:border-cyan-500';
      activeBg = 'bg-cyan-950/80 text-cyan-200 border-cyan-500';
    }

    return (
      <div key={node.id} className="pl-3.5 border-l border-slate-900/60 my-0.5">
        <div 
          onClick={() => selectNode(node)}
          className={`flex items-center gap-1.5 p-1.5 rounded-md cursor-pointer transition-all border text-xs ${
            isSelected ? activeBg + ' font-medium shadow scale-[1.01]' : 'text-slate-300 hover:bg-slate-900/50 ' + categoryBorder
          }`}
        >
          {hasChildren ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-0.5 hover:bg-slate-800/50 rounded text-slate-500"
            >
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <div className="h-3 w-3 flex items-center justify-center shrink-0">
              <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-current animate-ping' : 'bg-slate-600'}`} />
            </div>
          )}

          <div className="flex-1 flex flex-col items-start min-w-0">
            <span className="truncate w-full block leading-tight">{node.label}</span>
          </div>

          {!node.children && (
            <span className="text-[9px] bg-slate-900 px-1 py-0.2 rounded text-slate-500 font-mono">
              LAB
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-0.5 flex flex-col gap-0.5">
            {node.children.map(child => renderMindMapBranch(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* CABEÇALHO */}
      <header className="border-b border-slate-900 bg-slate-900/50 backdrop-blur px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-pink-600 rounded-xl text-white shadow-lg">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Processador e Analisador de Visão Computacional
            </h1>
            <p className="text-[11px] text-slate-400">
              Filtros Espaciais/Frequência • Processamento Morfológico Avançado • Modelos de Segmentação Ativa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded-full border border-indigo-500/10 font-mono">
            <Activity className="h-3 w-3 animate-pulse" />
            <span>ALGORITMOS COMPUTACIONAIS ATIVOS</span>
          </div>
        </div>
      </header>

      {/* PAINEL CENTRAL */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden h-[calc(100vh-62px)]">
        
        {/* EXPLORADOR DE MAPA MENTAL (5 colunas) */}
        <section className="xl:col-span-5 border-r border-slate-900 flex flex-col overflow-y-auto p-4 bg-slate-950">
          
          <div className="mb-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Pesquisar ramos, usos, termos ou modelos de filtros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600 transition"
              />
            </div>

            {/* SELETOR DE ATALHOS DE CATEGORIA */}
            <div className="flex flex-wrap gap-1 p-1 bg-slate-900/40 rounded-lg text-[10px]">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${activeTab === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setActiveTab('espacial')}
                className={`px-2 py-1 rounded-md font-medium transition flex items-center gap-1 ${activeTab === 'espacial' ? 'bg-emerald-950 text-emerald-300 shadow border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Espacial
              </button>
              <button 
                onClick={() => setActiveTab('frequencia')}
                className={`px-2 py-1 rounded-md font-medium transition flex items-center gap-1 ${activeTab === 'frequencia' ? 'bg-indigo-950 text-indigo-300 shadow border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Frequência
              </button>
              <button 
                onClick={() => setActiveTab('morfologia')}
                className={`px-2 py-1 rounded-md font-medium transition flex items-center gap-1 ${activeTab === 'morfologia' ? 'bg-pink-950 text-pink-300 shadow border border-pink-500/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Morfologia
              </button>
              <button 
                onClick={() => setActiveTab('segmentacao')}
                className={`px-2 py-1 rounded-md font-medium transition flex items-center gap-1 ${activeTab === 'segmentacao' ? 'bg-amber-950 text-amber-300 shadow border border-amber-500/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Segmentação
              </button>
            </div>
          </div>

          {/* ÁRVORE DO MAPA MENTAL DINÂMICO */}
          <div className="flex-1 border border-slate-900 rounded-xl bg-slate-950/40 p-2.5 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between px-1 pb-1.5 border-b border-slate-900 text-[10px] text-slate-500 uppercase tracking-wider font-mono">
              <span>Ramos Estruturais do Mapa</span>
              <span>Selecione para Processar</span>
            </div>

            {searchQuery === '' && activeTab === 'all' ? (
              renderMindMapBranch(filterData)
            ) : (
              <div className="space-y-1">
                {filteredNodes.length > 0 ? (
                  filteredNodes.map(node => (
                    <div 
                      key={node.id}
                      onClick={() => selectNode(node)}
                      className={`p-2 rounded-lg border cursor-pointer flex justify-between items-start gap-1.5 transition-all text-xs ${
                        selectedNode?.id === node.id 
                          ? 'bg-indigo-950/40 border-indigo-500 text-indigo-100' 
                          : 'bg-slate-900/20 hover:bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            node.category === 'espacial' ? 'bg-emerald-400' :
                            node.category === 'frequencia' ? 'bg-indigo-400' :
                            node.category === 'morfologia' ? 'bg-pink-400' :
                            node.category === 'segmentacao' ? 'bg-amber-400' : 'bg-cyan-400'
                          }`} />
                          <h4 className="text-[8px] font-bold font-mono tracking-wider uppercase text-slate-500">
                            {node.category || 'Organização'}
                          </h4>
                        </div>
                        <h3 className="font-semibold truncate">{node.label}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{node.description || node.details}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0 self-center" />
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs font-mono">
                    Nenhum nó estrutural correspondente.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 p-2.5 border border-indigo-950/40 rounded-xl bg-indigo-950/10 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-400">Clique nos ramos terminais para injetar no simulador ao lado!</span>
            </div>
          </div>
        </section>

        {/* LABORATÓRIO DE SIMULAÇÃO E DETALHAMENTO MATEMÁTICO (7 colunas) */}
        <section className="xl:col-span-7 flex flex-col bg-slate-900/10 overflow-y-auto">
          
          {/* TAB SECTOR DO LABORATÓRIO */}
          <div className="border-b border-slate-900 px-6 py-2 bg-slate-950 flex items-center justify-between gap-4 shrink-0">
            <div className="flex gap-1">
              <button 
                onClick={() => setActiveDemoTab('canvas')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                  activeDemoTab === 'canvas' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Simulador Dinâmico
              </button>
              <button 
                onClick={() => setActiveDemoTab('formula')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
                  activeDemoTab === 'formula' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Teoria Científica
              </button>
            </div>

            {selectedNode && (
              <span className="text-[10px] text-indigo-400 font-mono tracking-wider font-semibold uppercase flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-ping" />
                Foco: {selectedNode.label.split('(')[0]}
              </span>
            )}
          </div>

          {/* CONTEXTO ATIVO */}
          <div className="flex-1 p-5 space-y-5">

            {/* CARD PRINCIPAL DO NÓ ATIVO */}
            {selectedNode && (
              <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute -top-6 -right-6 p-4 opacity-[0.02] pointer-events-none">
                  <Cpu className="h-24 w-24" />
                </div>

                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest border ${
                    selectedNode.category === 'espacial' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20' :
                    selectedNode.category === 'frequencia' ? 'bg-indigo-950/40 text-indigo-300 border-indigo-500/20' :
                    selectedNode.category === 'morfologia' ? 'bg-pink-950/40 text-pink-300 border-pink-500/20' :
                    selectedNode.category === 'segmentacao' ? 'bg-amber-950/40 text-amber-300 border-amber-500/20' :
                    'bg-cyan-950/40 text-cyan-300 border-cyan-500/20'
                  }`}>
                    {selectedNode.category === 'espacial' ? 'Domínio Espacial' :
                     selectedNode.category === 'frequencia' ? 'Domínio da Frequência' :
                     selectedNode.category === 'morfologia' ? 'Processamento Morfológico' :
                     selectedNode.category === 'segmentacao' ? 'Segmentação Ativa' : 'Algoritmo de Restauração'}
                  </span>
                </div>

                <h2 className="text-xl font-bold tracking-tight text-white mb-1.5">
                  {selectedNode.label}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedNode.details || selectedNode.description}
                </p>

                {/* BANNER DA FÓRMULA MATEMÁTICA EM LATEX */}
                {selectedNode.math && (
                  <div className="mt-3.5 p-2 rounded bg-slate-950 border border-slate-900 flex flex-col md:flex-row items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded font-sans uppercase font-bold shrink-0">Expressão de Base</span>
                    <div className="bg-slate-950 p-1 text-center text-indigo-300 overflow-x-auto w-full">
                      <code>{selectedNode.math}</code>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB DO SIMULADOR PRÁTICO EM CANVAS */}
            {activeDemoTab === 'canvas' && (
              <div className="space-y-4">
                
                {/* GRID DO FLUXO DO SINAL DIGITAL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* ORIGINAL */}
                  <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-xl flex flex-col items-center">
                    <div className="w-full flex items-center justify-between text-slate-400 text-[10px] font-mono mb-1.5">
                      <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Imagem Original</span>
                      <span className="text-[9px] uppercase text-slate-600 font-bold">In</span>
                    </div>
                    <div className="relative border border-slate-800 rounded bg-[#0f172a] overflow-hidden w-[160px] h-[160px]">
                      <canvas ref={sourceCanvasRef} width={160} height={160} className="w-full h-full block" />
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1.5 font-sans">Vetor ideal calibrado de teste</span>
                  </div>

                  {/* DEGRADADA / COM RUÍDO */}
                  <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-xl flex flex-col items-center">
                    <div className="w-full flex items-center justify-between text-slate-400 text-[10px] font-mono mb-1.5">
                      <span className="flex items-center gap-1 text-rose-400"><Sliders className="h-3 w-3" /> Degradação/Sinal</span>
                      <span className="text-[9px] bg-rose-950/40 text-rose-300 px-1 py-0.2 rounded font-bold">Ruído</span>
                    </div>
                    <div className="relative border border-slate-800 rounded bg-[#0f172a] overflow-hidden w-[160px] h-[160px]">
                      <canvas ref={degradedCanvasRef} width={160} height={160} className="w-full h-full block" />
                    </div>
                    <div className="w-full mt-1.5 flex justify-between items-center text-[9px] text-slate-500 font-mono">
                      <span>{noiseType}</span>
                      <span>{(noiseLevel * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* FILTRADA / PROCESSADA */}
                  <div className="bg-slate-950 border border-indigo-950 p-2.5 rounded-xl flex flex-col items-center shadow-lg">
                    <div className="w-full flex items-center justify-between text-slate-400 text-[10px] font-mono mb-1.5">
                      <span className="flex items-center gap-1 text-emerald-400"><Eye className="h-3 w-3" /> Saída Filtrada</span>
                      <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1 py-0.2 rounded font-bold">Out</span>
                    </div>
                    <div className="relative border border-emerald-900/30 rounded bg-[#0f172a] overflow-hidden w-[160px] h-[160px]">
                      <canvas ref={resultCanvasRef} width={160} height={160} className="w-full h-full block" />
                      {isProcessing && (
                        <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-1">
                          <RefreshCw className="h-5 w-5 text-indigo-500 animate-spin" />
                          <span className="text-[9px] text-indigo-400 font-mono">Processando...</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-emerald-400 mt-1.5 font-mono flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Kernels aplicados com sucesso
                    </span>
                  </div>

                </div>

                {/* PAINEL DE CONTROLE DE PARAMETROS */}
                <div className="bg-slate-900/30 border border-slate-800 p-3.5 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800/60 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                    <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Gerenciamento Paramétrico do Sinal</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-medium block">1. Canal de Entrada (Ruído/Luz)</label>
                      <select 
                        value={noiseType}
                        onChange={(e) => setNoiseType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="salt_pepper">Impulsivo (Sal e Pimenta)</option>
                        <option value="gaussian">Estocástico (Gaussiano)</option>
                        <option value="motion_blur">Movimento Linear (Borrão)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <label className="font-medium">2. Razão do Ruído</label>
                        <span className="font-mono font-bold text-indigo-400">{(noiseLevel * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.05" 
                        max="0.55" 
                        step="0.05"
                        value={noiseLevel}
                        onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <label className="font-medium">3. Resolução do Elemento / Kernel</label>
                        <span className="font-mono font-bold text-indigo-400">{filterStrength}x{filterStrength}</span>
                      </div>
                      <input 
                        type="range" 
                        min="3" 
                        max="7" 
                        step="2"
                        value={filterStrength}
                        onChange={(e) => setFilterStrength(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                  </div>
                </div>

                {/* CASOS DE USO REAIS DA INDÚSTRIA */}
                <div className="bg-slate-900/10 border border-slate-800/80 rounded-xl p-3.5">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    Aplicações de Linha de Produção & Diagnóstico
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-2">
                    {selectedNode.useCases ? (
                      selectedNode.useCases.map((useCase, index) => (
                        <div key={index} className="flex gap-2 items-start bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-indigo-300 text-[9px] font-mono font-bold border border-indigo-500/10">
                            {index + 1}
                          </span>
                          <p className="text-[10px] text-slate-300 leading-normal">
                            {useCase}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-2 text-xs text-slate-500 font-mono">
                        Selecione um filtro para abrir os casos de uso de visão industrial correspondentes.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB DE TEORIA E COMPÊNDIO */}
            {activeDemoTab === 'formula' && (
              <div className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-emerald-950/10 border border-emerald-900/20 rounded-xl">
                    <h3 className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Domínio Espacial
                    </h3>
                    <p className="text-[10px] text-slate-300 leading-normal">
                      Trabalha de maneira imediata e local sobre os pixels. Excelente para operações locais, convolução matricial e detecção de bordas baseadas em descontinuidades lineares.
                    </p>
                  </div>

                  <div className="p-3 bg-indigo-950/10 border border-indigo-900/20 rounded-xl">
                    <h3 className="text-xs font-bold text-indigo-400 mb-1 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      Frequência (FFT)
                    </h3>
                    <p className="text-[10px] text-slate-300 leading-normal">
                      Atua no espectro das ondas espaciais senoidais. Remove de forma paramétrica ruídos constantes de fundo e perturbações periódicas do sensor.
                    </p>
                  </div>

                  <div className="p-3 bg-pink-950/10 border border-pink-900/20 rounded-xl">
                    <h3 className="text-xs font-bold text-pink-400 mb-1 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                      Morfologia
                    </h3>
                    <p className="text-[10px] text-slate-300 leading-normal">
                      Foca na análise estrutural e geométrica dos contornos baseando-se em interações de conjuntos (união, interseção) de formas complexas.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-950/10 border border-amber-900/20 rounded-xl">
                    <h3 className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Segmentação
                    </h3>
                    <p className="text-[10px] text-slate-300 leading-normal">
                      Divide a imagem em regiões isoladas coerentes com o objetivo de facilitar a identificação, classificação e contagem de itens por robôs.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl space-y-3">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <Info className="h-4 w-4 text-indigo-400" />
                    Detalhamento Acadêmico: {selectedNode.label}
                  </h3>
                  
                  <div className="space-y-3 text-[11px] text-slate-300 leading-relaxed">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 space-y-2.5">
                      <h4 className="font-bold text-slate-200">Como funciona matematicamente?</h4>
                      <p>
                        A imagem é tratada de acordo com as propriedades locais do kernel ou elemento estruturante. Para o modelo ativo:
                      </p>
                      
                      {selectedNode.math ? (
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 font-mono text-center text-xs text-indigo-300 overflow-x-auto">
                          {selectedNode.math}
                        </div>
                      ) : (
                        <div className="text-center py-1 text-slate-600 font-mono text-[10px]">
                          Fórmula complexa de processamento matricial adaptativo.
                        </div>
                      )}

                      <p>
                        {selectedNode.details}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                        <h4 className="font-bold text-emerald-400 mb-1.5">Vantagens Operacionais</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-400 text-[10px]">
                          <li>Alto ganho computacional em tempo real sobre chips integrados.</li>
                          <li>Perfeito para limpeza e pré-tratamento de imagem antes de redes neurais.</li>
                          <li>Limitações finas de ruído podem ser totalmente eliminadas parametrizando o elemento estruturante.</li>
                        </ul>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                        <h4 className="font-bold text-rose-400 mb-1.5">Limitações Clínicas / Industriais</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-400 text-[10px]">
                          <li>Se o elemento estruturante for muito largo, formas originais menores podem ser erodidas.</li>
                          <li>Segmentação inadequada por Otsu pode falhar com iluminação assimétrica.</li>
                          <li>Bordas ruidosas geram over-segmentação em algoritmos como Watershed tradicional.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          <footer className="border-t border-slate-900 bg-slate-950/80 p-3 text-center text-slate-600 text-[10px] font-mono shrink-0">
            <span>Visualizador de Visão de Máquina de Alto Desempenho. Todos os direitos reservados.</span>
          </footer>
        </section>

      </div>
    </div>
  );
}