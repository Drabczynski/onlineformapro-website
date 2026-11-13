/* Un forfait de téléphone : dans la vidéo, on clique au moment où le vendeur dit le prix (« vingt gigas » vient avant :
   ce n'est pas le prix) ; puis on complète l'affiche du forfait avec les étiquettes (les gigas, « par mois ») ; enfin,
   sur la carte du réseau, on allume les zones où la cliente peut appeler (la France et l'Europe, pas le Congo). */
window.SCENARIO = (() => {
  /* la carte : Europe et Afrique (d3-geo, projection azimutale équivalente, Natural Earth 1:110 M), en unités du viewBox ;
     le reste des terres (Russie, Moyen-Orient…) en décor ; l'Amérique et l'Asie hors de la carte, en pastilles sur les bords */
  const CARTE = {"W":400,"H":430,"france":"M166.2,87.6L167.4,88.7L171.4,89.6L169.8,92.3L169.2,95L168.3,95.7L167.1,95.2L167.1,96.2L164.8,98.3L164.6,100.1L166,99.6L166.9,101.3L166.6,102.5L167.4,104L166.3,105.1L166.8,108.2L168.4,108.8L167.9,110.5L165,112.6L159.1,111.2L154.5,112.2L153.9,114.5L150.3,114.8L147.1,112.7L145.8,113.4L140.5,111L139.6,109.4L141.6,107.2L143.5,99.4L141.3,94.9L139.7,92.7L135.7,90.7L136.1,87.8L139.8,87.4L144.2,89L144.2,84.5L146.5,86.4L153.3,84L154.7,80.9L157.1,80.4L157.3,81.8L158.5,81.9L159.6,83.6L161.2,85.6L162.7,85.4L164.9,87.3L165.4,87.7ZM171.6,114.9L173.7,113.4L174.1,116.9L172.9,119.9L171.5,119L170.9,116.3Z","europe":"M205.9,24.5L202.9,25.8L201.5,28.5L202,30.7L199.3,33.9L195.7,37.2L194.4,42.6L196.1,45.2L198.3,47.2L196.6,51.5L194.3,52.5L193.6,58.9L192.4,62.5L189.4,62.2L188.1,65.2L185.2,65.4L184.5,61.8L182.6,57.4L181.1,52L179.7,49.6L174.9,53.8L171.8,54.6L168.8,52.4L168.6,48.3L169.1,39.6L171.3,37.3L177,34.5L181.1,30.8L184.8,25.7L189.1,18.6L191.9,15.8L196,11.1L199.2,9.3L201.8,9.3L203.5,6.1L206.3,6L208.7,4.9L214.1,6.9L212.5,8.1L214.8,10.1L212.6,12L211.4,12.5L211.9,15L215.1,17.1L214.3,20L217.5,23.9L217.1,27.2L219.5,29.7L219.4,32.2L223,34.3L222.8,36.3L221.5,38.7L218.2,44L214.4,44.8L210.8,46.5L207.4,47.6L205.8,45.6L203.6,44.5L203.6,40.8L202.2,37.5L202.9,35.2L204.4,32.8L208.2,28.4L209.3,27.5L208.8,26ZM233.9,102.1L234.1,103.1L232.8,104.1L231.9,103.8L231.8,108.7L230.5,110.5L229.9,113.4L231.2,115.6L228.5,115.3L225.5,116.8L227.1,117.7L226.5,120.3L225.8,120.8L223.9,120.9L222.2,120.6L218.5,121.9L220.9,124L219.4,124.8L217.6,124.9L215.8,122.9L215.3,123.8L216.2,126.2L218,128L216.8,128.9L218.8,130.6L220.5,131.7L220.8,134L217.7,133.1L218.8,135.1L216.8,135.6L218.3,139.1L216.1,139.3L213.3,137.6L211.8,134.5L211,131.9L209.6,130.1L207.8,127.9L207.6,126.7L207,126.5L206.9,125.6L205,124.3L204.7,122.4L204.8,119.7L205.1,118.5L204.6,117.9L203.9,117.6L202.9,116.3L201.6,115.6L198.6,114.2L196.8,112.8L194,111.6L191.4,108.8L192,108.5L190.6,106.8L190.5,105.5L188.6,104.9L187.7,106.6L186.8,105.2L186.9,103.9L187,103.8L187.6,103.5L185.3,102.9L182.9,104.3L183,106.2L182.6,107.3L183.6,109.4L186.4,111.4L187.9,114.7L191.4,117.8L193.8,117.8L194.6,118.7L193.7,119.5L196.6,120.9L198.9,122L201.7,124L202.1,124.8L201.6,126.2L199.7,124.4L196.9,123.8L195.7,126.4L198,127.8L197.7,129.9L196.4,130.2L194.7,133.6L193.3,134L193.3,132.7L194,130.6L194.7,129.7L193.4,127.4L192.3,125.4L191,124.9L190.1,123.2L188,122.5L186.7,120.9L184.3,120.6L181.9,118.8L179.1,116.2L177.1,113.9L176.3,109.9L174.9,109.4L172.5,108L171.1,108.5L169.2,110.3L167.9,110.5L168.4,108.8L166.8,108.2L166.3,105.1L167.4,104L166.6,102.5L166.9,101.3L166,99.6L164.6,100.1L164.8,98.3L167.1,96.2L167.1,95.2L168.3,95.7L169.2,95L169.8,92.3L171.4,89.6L167.4,88.7L166.2,87.6L165.4,87.7L164.9,87.3L162.7,85.4L161.2,85.6L159.6,83.6L158.5,81.9L157.3,81.8L157.1,80.4L159.3,79.8L160.8,78.8L163.9,73.3L167.6,71.9L169.7,72.1L170.2,71.4L172.4,71.3L172.8,72.1L174.7,70.3L174.2,68.8L174.2,66.6L173.4,64.5L173.7,60.6L174.2,59.5L174.9,58.4L177,58.3L177.9,57.2L179.9,56.2L179.7,58.2L178.9,59.4L179.1,60.5L180.4,61.1L179.8,62.5L179.1,62.1L177.2,64.8L177.7,66.7L177.7,68.2L180.2,69.2L180.1,70.5L182.7,69.8L184.1,68.8L186.9,70.3L188.1,71.6L189.9,70.4L193.8,68.6L196.9,67.2L199.4,67.8L199.6,68.7L202,68.7L205.2,69L209.8,68.6L209.5,67.7L209.6,66.6L208.4,66.1L205.8,65.6L204.9,62.4L204.7,59.5L205.6,57L207.6,55.6L209.9,58.3L211.8,58.1L211.8,55.1L211.7,52.8L210.9,53.4L209.3,52.2L208.8,50L211.4,48.7L214.1,47.9L216.6,48.3L218.8,47.9L219.3,48.5L218.2,50.9L219.6,54.4L218.8,55.7L220.1,56.4L220.7,58.2L221.9,60.4L224.6,61.1L225.2,62L226.3,61.3L228.9,61.9L229.6,63.7L229.3,64.8L231.4,67.1L232.6,67.6L232.6,68.4L234.5,68.8L235.4,69.7L234.7,70.7L232.6,70.8L232.2,71.3L233.1,72.5L234.3,74.8L235.3,74.9L235.8,73.9L236.6,74L239.1,73.2L241.3,75.1L240.9,76L241.4,77.2L243.6,77L244.9,78.5L245.1,79.3L248.8,80.1L250.6,79.1L252.8,80.6L254.3,80.3L258.6,80.8L259,81.9L258.6,84.2L259.9,86.2L259.9,87.6L257.3,88.4L256.2,89.7L256.7,91.4L254.5,92.2L253,93.7L250.5,94.4L248.4,96.2L249.1,98.3L248.6,98.2L248.1,97.5L247.1,97.5L244.9,97L244.4,98L243.9,97.7L239.2,97.3L238.7,95.8L236.2,96.6L235.6,98.9ZM229.2,142.9L228.9,144.1L224.1,144.8L224.1,144.1L219.9,143.6L220.4,141.8L222.3,143.1L224.9,142.7L227.4,142.8L227.4,143.5ZM117.5,132.4L116,133.2L114.4,132.4L112.7,132.6L113.8,129.5L114.1,127L112.8,126.5L112.4,124.8L113.2,122.2L114.8,121L115.4,119.4L116.6,117.1L117,115.4L116.7,113.9L116.9,112.6L117.8,109.8L117,107.8L121.9,105.7L125.3,106.9L129.3,107.5L132.3,108.6L134.8,108.7L139.6,109.4L140.5,111L145.8,113.4L147.1,112.7L150.3,114.8L153.9,114.5L153.8,116.8L150.5,119.3L146.4,119.8L145.9,121.1L143.7,123.1L142,126.2L142.9,128.6L140.8,130.2L139.8,132.8L137.2,133.3L134.4,136.2L130.3,135.8L127.2,135.4L124.9,136.5L123.4,137.9L121.8,137.4L120.9,135.8L120.4,133.4ZM137,67.2L136.7,70L133.8,73.1L128.7,74.6L125.2,73.3L128.5,69.7L128.5,65.6L132.8,63.2L135.1,61.8L137.2,62L139.1,64.7ZM190.3,133.1L192.8,132.7L191.7,135.8L192.2,137.1L191.5,139.1L188.9,137.7L187.3,137.2L182.7,135.2L183.2,133.1L187,133.5ZM171.1,121.8L172.8,120.6L174.5,123.5L173.9,128.7L172.4,128.4L171,129.7L169.9,128.6L170,123.8L169.4,121.5ZM183.9,62.5L184.6,64.4L183.1,67.5L180.6,65.3L180.3,63.7ZM144.3,70.1L144.3,70.1L145.2,67.9L144.1,65.3L144.1,65.3L141.3,64.2L141,63L142.3,61.5L141.8,60.3L140.1,61.9L140.9,58.2L140.3,56.1L142.3,52.4L145,49.6L146.6,50.2L149.4,50.2L145.9,54L148.4,53.8L150.9,54.1L149.5,57.1L146.6,60.3L149,60.8L149.1,61.3L150.2,66L151.8,66.8L152.5,71.4L152.9,73L155.9,74L155.2,76.5L153.7,77.5L154.4,79.6L151.6,81.4L148.1,80.9L143.3,81.5L142.3,80.6L140.1,82.1L137.7,81.4L135.5,82.6L134.3,81.6L139.2,78.1L141.7,77.6L141.7,77.6L137.8,76.4L137.4,74.7L140.4,73.9L139.5,71.6L140.7,69.2ZM137.9,17.2L136.3,19.4L137,22.3L133.4,24.4L127,25.4L125.1,25.6L123,24.3L118.9,21.6L121.5,20.6L119,17.6L122.4,18L123,17L120.1,14.9L122.7,13.1L125.4,13.5L126.4,16.7L130.1,15.6L131.5,17.3L135.3,16.2ZM250.8,141.4L251,141.4L251.3,140.3L253.7,140.1L256.4,138.5L254.5,140.5L254.9,141.2L255.1,141.5L252,143.6L250.2,143.3L249.2,141.7Z","afrique":"M291.1,302.4L289.3,307.6L289.5,309.9L292.1,311.2L292.2,312.3L291,314.8L291.3,316.1L291,318L292.3,320.5L293.9,324.4L295.3,325.2L295.9,326.9L295.6,331L296,334.6L295.8,340.9L296.4,342.9L295,345.8L293.3,348.7L290.6,351.4L286.9,353.1L282.3,355.3L277.5,359.9L275.9,360.7L272.9,363.6L271.2,364.6L270.7,367.4L272.3,370.4L272.9,372.6L272.8,373.8L273.5,373.6L273.1,377.4L272.3,379.3L273.1,379.9L272.4,381.6L270.6,383L267.3,384.5L262.4,386.7L260.6,388.2L260.7,389.8L261.7,390.1L261.1,392.1L259.9,394.9L259.1,398.1L257.9,399.9L255.1,401.9L254.3,402.5L252.5,404.4L251.2,406.4L248.8,409.2L244.1,413.1L241.2,415.4L238.2,417.2L234.2,418.7L232.3,418.9L231.7,419.9L229.5,419.4L227.6,420.1L223.6,419.4L221.4,419.9L219.8,419.7L215.9,421.2L212.7,421.8L210.3,423.2L208.6,423.3L207.1,422L205.9,422L204.3,420.3L204.1,420.8L203.7,419.8L203.8,417.7L202.6,415.2L203.9,414.5L203.8,411.6L201.4,408.2L199.6,405L199.6,405L196.9,400.1L194.1,397.2L192.6,394.5L191.7,390.8L190.8,388L189.5,382.1L189.4,377.5L188.9,375.4L187.3,373.8L185.2,370.6L183.1,366L182.2,363.5L178.9,359.7L178.6,356.7L178.2,354.3L178.8,350.8L180.2,347.2L180.4,345.6L181.7,342L182.7,340.4L185,337.8L186.3,336.1L186.8,333.1L186.5,330.9L185.3,329.4L184.2,327L183.2,324.6L183.4,323.8L184.7,322.2L183.4,318.4L182.6,315.7L180.5,313.2L180.9,312.4L182.6,311.9L183.8,311.9L185.3,311.5L197.5,311.5L198.5,314.5L199.6,316.8L200.6,318.1L202.2,320.2L204.9,319.9L206.3,319.3L208.5,319.8L209.2,318.8L210.2,316.4L212.8,316.2L213,315.5L215.1,315.5L214.7,316.9L219.7,316.8L219.8,319.3L220.6,320.8L220,323.3L220.3,325.7L221.7,327.1L221.4,331.9L222.4,331.5L224.2,331.6L226.7,330.9L228.6,331.1L230,331.1L230.2,332.4L232.2,332.2L234.8,332.5L236.1,334.3L239.3,334.7L241.9,333.4L242.7,335.4L245.9,335.9L247.3,337.5L248.9,339.6L252,339.5L251.8,335.3L250.7,336L247.9,334.6L246.8,333.9L247.4,329.9L248.2,325.1L247.3,323.4L248.5,320.8L249.6,320.2L255.1,319.3L256.7,319.6L254.5,314.6L252.2,312.5L251.4,310.2L251.8,308.1L251,304.4L250.7,299.5L249.7,297.7L250.1,295.5L250.6,295.1L250.7,292.7L251.9,291.5L251.9,288.4L252.8,286.8L252.9,283.5L253.8,281.6L255.3,279.4L256.8,278.2L258.1,276.7L256.4,276.2L256.5,271.4L252.9,268.9L251.8,267.2L249.6,268.2L247.7,268.1L246.7,268.8L244.8,268.4L242.3,265.2L240.9,265.7L238.3,265.7L235.3,265.5L233.8,265.9L233.2,266.9L231.9,267.1L230.3,266.3L225.8,268.5L223.9,268.2L223.4,268.5L222.2,271L219.1,270.3L216.1,270L213.5,268.6L210.1,267.3L208,268.6L206.4,270.7L206.1,273.5L203.4,273.4L200.7,272.7L198.2,274.9L196.1,278.7L195.8,280.9L192.5,279.9L189.2,278.9L184,278.7L183.7,280.5L184.9,282.6L187.9,282.2L189,283L187.2,287.7L189.1,290.1L189.6,293.3L189.1,295.9L187.8,297.8L184.2,297.7L182,295.7L181.6,297.5L178.8,298L177.4,299L179,301.7L175.8,303.8L171.6,299.7L168.9,296.4L166.4,292.2L166.5,290.8L167.4,289.6L168.4,286.6L169.3,283.6L168.5,283L170,278.5L170.6,275.3L169,272.6L167.2,271.9L166.4,270L165.3,269.4L165.4,268.3L161.1,269.7L159.6,269.4L158,270.3L154.7,270.1L152.6,267.5L151.3,264.5L148.5,261.7L145.5,261.6L141.9,261.4L138.5,261.8L135.3,262.5L128.8,264.5L126.5,265.8L122.8,266.7L119.3,265.3L117.5,265.2L114.7,264.2L112.1,264.1L107.3,264.4L104.5,265.4L100.4,266.6L99.6,266.4L98.6,266.3L94.6,264L91.1,260.5L87.9,257.9L85.4,254.9L84.4,254.5L81.6,252.5L79.8,250L79.2,248.4L79,245.3L77.5,242.6L76.2,240.8L75.2,240.1L74.3,239.2L74.1,237.3L73.6,236.3L72.6,235.4L70.7,233.4L69.1,232.9L68.4,231.6L68.5,230.9L67.4,229.9L67.3,229L67,225.7L67.8,223.9L66.7,220.4L65,218.6L66.8,218.1L69,215.4L70.2,213.4L70.2,211.1L71.6,209.2L72.6,205.4L72.9,201.2L72.8,199.1L73.5,197.1L72.9,194.9L71.3,192.8L71.8,191.1L72.3,189.2L73.9,188.3L75.5,186.4L75.5,184.9L77.3,182.2L79.8,179.9L81.2,179.5L82.6,177.2L83.1,175L84.9,172.7L87.5,171.6L90.6,167.8L90.6,167.7L92.7,166.5L96,166.5L99.3,164.1L101.3,163.3L104.8,160.3L104.9,155.1L106.9,151.8L107.7,149.8L110.4,147.3L114.1,146L116.9,144.6L119.9,140.8L121.4,138.4L123.8,138.7L125.5,140.7L128.7,140.8L132,142L133.4,142.2L136.9,140.4L140.6,140L142.9,138.5L146.3,137.6L151.9,137.3L157.4,137.3L159,138L162.3,136.6L165.8,136.7L167.1,137.7L169.4,137.5L173,136L175.3,136.6L175.1,138.6L178,137.2L178.2,138L176.5,139.9L176.4,141.7L177.5,142.8L177,146.2L174.7,148.2L175.3,150.4L177,150.5L177.9,152.5L179.2,153.1L183.2,154.6L184.7,154.2L187.6,154.9L192.2,156.7L193.8,160.3L197,161L202,162.6L205.9,164.5L207.6,163.4L209.2,161.5L208.2,158.4L209.2,156.4L211.6,154.4L213.9,153.8L218.7,154.4L220,156.1L221.3,156L222.4,156.7L225.9,156.9L226.9,158.2L231.5,157.8L235,158.6L238.6,159.5L240.3,160L242.8,158.5L244.1,157.2L247.1,156.5L249.6,156.8L250.8,158.7L251.4,157.3L254.3,157.9L257.1,157.8L258.6,156.6L261.5,162.3L262,163.3L261.3,165.1L261,168.2L260.4,170.5L259.7,171.3L258.3,170.1L256.4,168.5L253.1,162.9L252.8,163.3L254.8,167.5L257.6,171.3L261.2,177.4L262.8,179.4L264.3,181.6L268.3,185.8L267.6,186.6L268.1,189.2L272.9,192.4L273.7,193.1L275.4,197L274.7,197.9L275.8,202L277.8,206.8L279.4,207.6L281.6,208.9L284.4,213.4L286,217.1L288.3,218.8L294,222.1L296.4,224.2L298.7,226.3L300.1,227.5L302.1,228.5L303.2,229.7L303.3,231.4L301.2,232.7L303,233.7L304.3,234.3L305.2,235.9L307.2,237.4L309.1,237.1L312.6,235.5L316.7,234.4L319.9,232.6L321.8,232L323,231L325.1,230.5L326.3,230.2L328,229.3L329.9,228.5L331.5,226.7L332.9,226.4L333.2,227.6L333.2,230.1L333.5,232.3L332.9,234L332.4,238.8L331.1,243.8L329.3,249.6L326.6,256.3L323.6,261.5L319.4,267.9L315.7,271.8L310,276.7L306.4,280.3L302.3,285.8L301.4,288.1L300.5,289.1L297.7,291.1L296.8,292.9L295.3,293.3L294.8,296.3L293.5,298.1L292.7,300.9ZM183.7,307.1L182.2,308L181.5,309L181.4,310.7L180.3,311.1L179.2,308.1L180.9,306.4L182.1,305.7ZM331.5,330.8L332.5,332.5L333.3,335.2L333.5,340.1L334.4,342L333.8,344L333.1,345.3L331.9,343L331.1,344.3L331.6,347.3L331.1,349.1L329.9,350.1L329.3,353.6L327.3,358.6L324.7,364.4L321.3,372.3L319.1,378L316.6,382.8L313.4,383.9L309.8,385.7L307.8,384.8L305,383.6L304.3,381.5L304.5,378L303.5,374.8L303.5,372L304.6,369L306.4,368.2L306.6,366.9L308.8,363.7L309.4,361.1L308.7,359.3L308.2,356.8L308.2,353L309.8,350.7L310.5,348L312.5,347.7L314.7,346.7L316.2,345.9L318,345.7L320.4,343.1L323.8,340.3L325.1,338.1L324.7,336.4L326.3,336.8L328.7,333.7L328.9,331.2L330.3,329.2Z","congo1":"M206.1,273.5L205.8,276L204.6,278.2L203.8,280.7L203.4,284.3L203.6,286.6L202.9,288L202.8,289.5L202.4,290.8L199.6,292.8L197.8,294.9L196,298.8L196.1,302.1L195.1,303.4L192.7,305.4L190.2,307.9L188.7,307.2L188.4,306L186.2,306L184.8,307.5L183.7,307.1L182.1,305.7L180.9,306.4L179.2,308.1L175.8,303.8L179,301.7L177.4,299L178.8,298L181.6,297.5L182,295.7L184.2,297.7L187.8,297.8L189.1,295.9L189.6,293.3L189.1,290.1L187.2,287.7L189,283L187.9,282.2L184.9,282.6L183.7,280.5L184,278.7L189.2,278.9L192.5,279.9L195.8,280.9L196.1,278.7L198.2,274.9L200.7,272.7L203.4,273.4Z","congo2":"M251,304.4L251.8,308.1L251.4,310.2L252.2,312.5L254.5,314.6L256.7,319.6L255.1,319.3L249.6,320.2L248.5,320.8L247.3,323.4L248.2,325.1L247.4,329.9L246.8,333.9L247.9,334.6L250.7,336L251.8,335.3L252,339.5L248.9,339.6L247.3,337.5L245.9,335.9L242.7,335.4L241.9,333.4L239.3,334.7L236.1,334.3L234.8,332.5L232.2,332.2L230.2,332.4L230,331.1L228.6,331.1L226.7,330.9L224.2,331.6L222.4,331.5L221.4,331.9L221.7,327.1L220.3,325.7L220,323.3L220.6,320.8L219.8,319.3L219.7,316.8L214.7,316.9L215.1,315.5L213,315.5L212.8,316.2L210.2,316.4L209.2,318.8L208.5,319.8L206.3,319.3L204.9,319.9L202.2,320.2L200.6,318.1L199.6,316.8L198.5,314.5L197.5,311.5L185.3,311.5L183.8,311.9L182.6,311.9L180.9,312.4L180.3,311.1L181.4,310.7L181.5,309L182.2,308L183.7,307.1L184.8,307.5L186.2,306L188.4,306L188.7,307.2L190.2,307.9L192.7,305.4L195.1,303.4L196.1,302.1L196,298.8L197.8,294.9L199.6,292.8L202.4,290.8L202.8,289.5L202.9,288L203.6,286.6L203.4,284.3L203.8,280.7L204.6,278.2L205.8,276L206.1,273.5L206.4,270.7L208,268.6L210.1,267.3L213.5,268.6L216.1,270L219.1,270.3L222.2,271L223.4,268.5L223.9,268.2L225.8,268.5L230.3,266.3L231.9,267.1L233.2,266.9L233.8,265.9L235.3,265.5L238.3,265.7L240.9,265.7L242.3,265.2L244.8,268.4L246.7,268.8L247.7,268.1L249.6,268.2L251.8,267.2L252.9,268.9L256.5,271.4L256.4,276.2L258.1,276.7L256.8,278.2L255.3,279.4L253.8,281.6L252.9,283.5L252.8,286.8L251.9,288.4L251.9,291.5L250.7,292.7L250.6,295.1L250.1,295.5L249.7,297.7L250.7,299.5Z","neutre":"M42.3,0L42.1,0.4L38.5,5.4L35.5,6.7L35,10.3L33.9,13.4L35.1,16.4L34.8,18.4L32.3,21.6L32.9,23.1L32.2,24.9L28.4,28.8L25.9,29L23.5,29.1L19.8,27.8L14.9,28.6L11.8,26.5L9.6,22.3L7.6,19.8L6,18.3L2.1,19.2L0,18.6L0,0ZM0,21.3L1.6,21.6L3.9,23.8L3.3,26.9L0,27.5L0,21.3ZM0,40L2.7,38.9L0.3,41.5L0.2,43.9L0,43.9L0,40ZM25.6,31.7L22.6,33L18.5,35L20.7,34.8L21.1,36.5L19.3,37.2L19.9,39.5L21.5,39.3L22.3,41.8L19.3,43.9L21.2,44.3L19.7,46.4L18.3,49.1L14.8,51.6L13.8,51.1L13.1,49.4L16.2,46.8L16.1,46L11.1,47.3L10.2,46.3L13,45.7L12.1,43.4L10,42L6.8,38.8L7.6,37.5L9.8,37.3L10.1,35.7L13.5,34.9L20.7,31.1L23.7,30.1L26.3,30.2L26.9,31ZM7.1,22.6L7.9,22.9L8.8,25.9L8.7,28.9L8.1,29.6L7.3,28.9L6.6,25.7ZM304,102.8L303.4,101.9L303.4,100L302.3,98.8L298.5,98.4L295.8,95.3L293.9,94.7L293.3,93.5L296.1,93.1L295,90.2L296.9,88.9L299.5,88.8L298.2,84.9L296.7,82.6L294.2,83.6L291.5,83.4L289.3,85.9L287.1,87.4L286.9,90.1L284.5,91.4L283.3,96.1L287.3,99.2L288,101.9L292.8,105.8L295.1,107.4L297.6,109.9L299.1,109.7L300.4,110.5L298.1,111.5L298.7,114.7L298.7,116.2L297.9,117.4L298.7,119.4L300.7,122.1L303.8,122.2L306.6,123.7L311.2,123.2L315.5,120.8L315.4,119.8L313.8,117.1L312.5,112.8L309.7,112.2L309.4,109.2L307.4,109.5L306.6,106L309.7,106.2L311.7,104.2L308.6,102.4L306.8,100.4L305,102.1L305.9,105.1ZM400,170L399.8,169.5L397.8,165.7L394.1,170.1L391.7,170.4L385.8,166.7L386.8,164.6L385.3,163.2L380.3,161L377.6,160.8L375.6,158.1L372,155.7L366.4,158.5L361.2,160.3L356.9,162.4L350.3,163L346.4,163.1L342.5,163.6L339.5,158.9L337.7,158.6L335.4,160L332.7,162.9L328.2,162.5L323.9,160.2L320.4,159.8L317,156.4L313,151.5L311.5,152.6L309,151.7L308.2,153.6L306.2,153.8L307.3,155.5L307.3,156.5L309.2,159.3L311.4,162.6L313.3,163.2L314.3,164.5L317.1,165.7L317.7,167.4L317.7,168.8L318.5,170.1L319.8,171.1L320.6,172.3L321.3,173.2L320.4,170.3L320.7,167.9L321.5,167.2L322.9,168.3L323.6,170.7L323.5,173.3L324.5,174.8L325.1,174.4L325.5,175.5L328,174.2L330.9,173.7L333,173.3L334.6,169.9L336.3,166.6L337.7,163.5L338.2,161.8L338.8,162L339,163.8L338.8,164.7L340.2,167.9L342.5,170.3L344.8,171.4L347.4,171.2L349.6,171.4L351.8,173.4L353.2,174.6L354.5,174.8L354.8,175.7L354.2,178.6L354,179.9L353,181.7L352.4,184.9L350.8,185.1L350.3,186.3L350.3,188.6L351.4,191.3L351.2,191.9L349.6,192.3L347.8,194.4L347.9,196.6L347.3,197.7L345.1,198.2L343.9,199.6L344.3,201.3L342.8,202.8L340.7,202.9L338.6,204.8L337,205.4L334.6,207.1L334.2,209.1L334.4,210.6L331,213.1L325.5,216.2L322.6,219.7L321,220.3L319.8,220.2L317.9,222.3L315.6,223.5L312.4,224.2L311.5,224.6L310.8,225.9L309.9,226.3L309.4,227.5L307.5,227.7L306.4,228.4L303.7,228.6L302.4,226.3L302.2,224L301.4,222.8L300.3,219.9L299,218.3L299.7,218L299.1,216.2L299.4,215.3L299,213.5L298.3,211.8L297,210.7L296.4,209.1L294.3,207.9L291.8,204.7L290.2,201.5L287.3,199L285.5,198.6L282.5,195L281.6,192.1L281.4,189.7L278.6,185.4L276.6,184L274.5,183.5L273,181.3L273,180.3L271.7,178.3L270.5,177.5L268.6,174.7L265.9,171.7L263.7,169.1L261.9,169.3L262.1,167L262.1,165.6L262.2,163.9L262,163.3L261.5,162.3L258.6,156.6L259.4,155.2L259.1,155L259.7,152.9L259.8,149.8L260.1,148.7L260.2,148.7L260.8,145.2L261.9,142.1L261.9,142L261,138.9L261.5,137.2L259.9,135.5L260.8,133.8L258.9,134.5L256,133.9L254.2,136.5L249.4,137.6L246.3,135.8L242.8,136L242.3,137.8L240.1,138.5L236.6,136.6L233,137L230.6,133.2L227.9,131.2L229.1,128L226.9,126.2L229.9,122.1L234.7,121.5L235.5,118.3L241.5,118.2L244.7,115.2L248,113.6L253,112.8L258.9,114.8L263.7,115.6L267,114.4L269.7,114.2L272.6,111.5L272.6,109.7L271,107.2L268.9,106L267.2,105.9L265.8,104.9L261.1,102.3L257.4,101.4L254.3,99.5L256.2,98.5L257.7,94.8L255.7,93.5L259.3,91.2L258.9,90.4L256.7,91.4L256.2,89.7L257.3,88.4L259.9,87.6L259.9,86.2L258.6,84.2L259,81.9L258.6,80.8L254.3,80.3L252.8,80.6L250.6,79.1L248.8,80.1L245.1,79.3L244.9,78.5L243.6,77L241.4,77.2L240.9,76L241.3,75.1L239.1,73.2L236.6,74L235.8,73.9L235.3,74.9L234.3,74.8L233.1,72.5L232.2,71.3L232.6,70.8L234.7,70.7L235.4,69.7L234.5,68.8L232.6,68.4L232.6,67.6L231.4,67.1L229.3,64.8L229.6,63.7L228.9,61.9L226.3,61.3L225.2,62L224.6,61.1L221.9,60.4L220.7,58.2L220.1,56.4L218.8,55.7L219.6,54.4L218.2,50.9L219.3,48.5L218.8,47.9L220.8,45.6L218.2,44L221.5,38.7L222.8,36.3L223,34.3L219.4,32.2L219.5,29.7L217.1,27.2L217.5,23.9L214.3,20L215.1,17.1L211.9,15L211.4,12.5L212.6,12L214.8,10.1L216,8.6L219.3,10.3L223.9,10.3L231.6,12.9L233.7,14.3L234.9,16.6L234,18.9L231.6,20.5L222.8,19.4L221.7,20.1L225.5,22.2L226.3,23.8L227.7,27.5L230.5,28.2L232.3,28.8L231.9,27L230.2,25.7L230.8,24.1L236.1,25.4L237.2,24.1L234.8,21.8L237.1,17.3L238.7,17.1L240.9,17.9L240.5,15.2L238.1,13.5L237.7,11.2L235.3,9.4L240.2,9.2L242.3,10.9L240.6,11.9L241.7,13.8L243.6,14.6L245.6,13.1L244.6,10.8L246.7,8.1L249.5,3.2L250.7,3L250.9,5.5L252.9,5.1L253,3.6L255.5,2.3L256.3,0.1L259.5,1.2L259.3,0L400,0ZM209.8,68.6L205.2,69L202,68.7L202.5,67L205.8,65.6L208.4,66.1L209.6,66.6L209.5,67.7ZM244.4,98L244.9,97L247.1,97.5L248.1,97.5L248.6,98.2L249.1,98.3L249.2,98.6L250.8,99.4L253.7,98.6L253.5,100.1L250.5,101.3L247.1,104.2L245.3,103.6L245.5,101.7L242.1,101L242.5,100.1L244.9,98.4ZM132.2,0L133.9,0.9L128.1,2.3L122.3,3.3L117.4,2.6L115.9,1.8L113.4,2.4L108.4,4.7L103.3,5.3L102.2,4.9L99.6,4.6L97,4.1L93.8,5.3L91.5,7.5L88.6,9.1L83.7,10L81.7,12.9L78.4,15.1L74.4,17.7L72.1,16.5L72.7,12.3L69.9,10.1L70.5,7.4L73.2,3.7L74.9,0L132.2,0ZM225.5,116.8L228.5,115.3L231.2,115.6L231.8,117.1L234.7,118.1L234.3,119.1L230.6,119.7L229.4,121L227.1,123.4L225.9,121.6L225.8,120.8L226.5,120.3L227.1,117.7Z"};
  const ZONES = [
    { id: 'france', nom: 'France', x: 23, y: 21.5 },                // dans l'Atlantique, reliée à la France par un trait
    { id: 'europe', nom: 'Europe', x: 53.8, y: 19.8 },
    { id: 'afrique', nom: 'Afrique', x: 46, y: 47 },
    { id: 'congo', nom: 'Congo', x: 55.2, y: 69.7 },
    { id: 'amerique', nom: 'Amérique', x: 12, y: 33, bord: 'g' },
    { id: 'asie', nom: 'Asie', x: 88, y: 31, bord: 'd' },
  ];
  const BONNES = ['france', 'europe'];
  const RESEAU = '<svg class="barres" viewBox="0 0 16 14" aria-hidden="true"><rect x="0" y="9" width="3" height="5" rx="1"/><rect x="4.3" y="6" width="3" height="8" rx="1"/><rect x="8.6" y="3" width="3" height="11" rx="1"/><rect x="12.9" y="0" width="3" height="14" rx="1"/></svg>';
  const FLECHE = { g: '<svg class="dir" viewBox="0 0 12 12" aria-hidden="true"><path d="M8 2 4 6l4 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    d: '<svg class="dir" viewBox="0 0 12 12" aria-hidden="true"><path d="m4 2 4 4-4 4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' };
  const carte = () => `<div class="carte" id="carte">
      <svg viewBox="0 0 ${CARTE.W} ${CARTE.H}" aria-hidden="true">
        <rect width="${CARTE.W}" height="${CARTE.H}" class="mer"/>
        <path class="decor" d="${CARTE.neutre}"/>
        <path class="pays" data-z="afrique" d="${CARTE.afrique}"/>
        <path class="pays" data-z="congo" d="${CARTE.congo1}"/><path class="pays" data-z="congo" d="${CARTE.congo2}"/>
        <path class="pays" data-z="europe" d="${CARTE.europe}"/>
        <path class="lien" d="M120 93.5 141 100"/>
        <path class="pays elargi" data-z="france" d="${CARTE.france}"/>
        <path class="pays" data-z="france" d="${CARTE.france}"/>
      </svg>
      ${ZONES.map(z => `<button class="pastille${z.bord ? ' bord' : ''}" data-z="${z.id}" aria-pressed="false" style="left: ${z.x}%; top: ${z.y}%">${z.bord === 'g' ? FLECHE.g : ''}<span>${z.nom}</span>${z.bord === 'd' ? FLECHE.d : ''}${RESEAU}</button>`).join('')}
    </div>`;

  /* l'affiche du forfait : le prix est déjà écrit (trouvé dans la vidéo), il reste les gigas et « par … » */
  const GIGAS = [5, 10, 20, 50], PAR = ['jour', 'semaine', 'mois'];
  const LIRE = { 5: 'cinq', 10: 'dix', 20: 'vingt', 50: 'cinquante' };
  const affiche = () => `<div class="affiche" id="affiche">
      <div class="aff-tete">${RESEAU}<span>Forfait mobile</span></div>
      <div class="aff-corps">
        <div class="aff-go"><button class="case" data-c="go" aria-label="Combien de gigas ?"><span class="vide">?</span></button><span class="unite">Go<small>gigas</small></span></div>
        <div class="aff-prix"><b>10&nbsp;€</b><span class="par">par</span><button class="case mot" data-c="par" aria-label="Par jour, par semaine ou par mois ?"><span class="vide">?</span></button></div>
      </div>
    </div>
    <div class="etiquettes">
      <div class="rang">${GIGAS.map(v => `<button class="etiq" data-c="go" data-v="${v}">${v}</button>`).join('')}</div>
      <div class="rang">${PAR.map(v => `<button class="etiq mot" data-c="par" data-v="${v}">${v}</button>`).join('')}</div>
    </div>`;

  return {
    plans: [{ de: 0, cx: { vendeur: .24, cliente: .75 } }, { de: 2, cx: { vendeur: .44, cliente: .9 } }, { de: 4.92, cx: { vendeur: .1, cliente: .58 } },
      { de: 6.88, cx: { vendeur: .45, cliente: .9 } }, { de: 8.92, cx: { vendeur: .25, cliente: .75 } }],
    ordre: ['prix', 'affiche', 'carte'],
    bravo: 'Bravo\u202f! Tu as bien compris le forfait de la cliente.',
    etapes: A => {
      const { $, $$, NB, state, alive, Q, yourTurn, setTurn, setSide, frameTo, CROPS, freeze, playSegment, phrase, ligne, side, idle, tapHere, sfx, faux, juste, suite, goBtn, wait, zones, cam, avant, marque, fly, gel, stopAll } = A;
      const OFFRE = ligne(1), APPEL = [ligne(2)[0], ligne(3)[1]];
      return {
        /* 1 · dans la vidéo : la cliente demande, le vendeur répond ; on clique quand il dit le prix (pas les gigas) */
        async prix(f) {
          const PRIX = phrase('dix euros'), BON = [PRIX[0] - .06, OFFRE[1] + .5], GIG = OFFRE[0] - .1, FIN = 4.85;
          let touche = null, debut = ligne(0)[0];
          setSide(null); frameTo(CROPS.full, false); idle.clear();
          state.gel = debut; await freeze(debut); if (!alive(f)) return;
          state.ask = 'Clique sur la vidéo quand tu entends le prix.';
          if (!await Q.say(state.ask, f)) return;
          async function lancer() {
            touche = null; Q.show('you', state.ask); setTurn('you'); cam.classList.add('asking');
            await playSegment(debut, FIN, null);
            if (!alive(f) || touche !== null) return;
            cam.classList.remove('asking'); setTurn('wait');
            rater("Tu n'as pas cliqué. Écoute encore.");
          }
          async function rater(msg) {
            const montrer = await faux(f, OFFRE, msg); if (montrer === null) return;
            if (montrer) { Q.show('ok', 'Le prix' + NB + ': «' + NB + 'dix euros' + NB + '».'); state.essais = 0; suite(); }
            else { debut = 1.9; await wait(300); if (alive(f)) lancer(); }   // la 2e fois, on repart juste avant le vendeur
          }
          zones([{ id: 'ecran', label: 'Cliquer sur la vidéo', x: 0, y: 0, w: 100, h: 100 }], async (id, ev) => {
            const t = $('#vid').currentTime; touche = t; stopAll(); cam.classList.remove('asking'); setTurn('wait');
            const r = cam.getBoundingClientRect(), z = { x: (ev.clientX - r.left) / r.width * 100, y: (ev.clientY - r.top) / r.height * 100, w: 0, h: 0 };
            if (t >= BON[0] && t <= BON[1]) {
              marque(z, 'dix euros', 'juste');
              if (!await juste(f, 'Oui' + NB + '! Dix euros, c\'est le prix.')) return;
              zones(null); suite();
            } else if (t >= GIG) {
              marque(z, 'pas le prix', 'faux');
              rater('Les gigas, c\'est pour internet. Écoute le prix.');
            } else {
              marque(z, 'trop tôt', 'faux');
              rater('Pas encore. Écoute le vendeur.');
            }
          });
          $('.hit[data-id="ecran"]', cam).classList.add('ecran');
          state.replay = () => { if (document.body.dataset.turn !== 'you') return; stopAll(); lancer(); };
          lancer();
        },

        /* 2 · l'affiche : le vendeur redit l'offre ; on pose les étiquettes (les gigas, « par … »), puis Valider */
        async affiche(f) {
          const pose = { go: null, par: null };
          const caseDe = c => $(`.case[data-c="${c}"]`, side);
          const montrerCase = (c, v) => {
            const b = caseDe(c); if (!b) return;
            b.classList.remove('faux', 'juste'); b.classList.toggle('pleine', v != null);
            b.innerHTML = v == null ? '<span class="vide">?</span>' : `<span class="val">${v}</span>`;
            b.setAttribute('aria-label', v == null ? (c === 'go' ? 'Combien de gigas' + NB + '?' : 'Par jour, par semaine ou par mois' + NB + '?') : 'Enlever ' + v);
            $$(`.etiq[data-c="${c}"]`, side).forEach(e => e.classList.toggle('pris', e.dataset.v === String(v)));
          };
          const poser = async (c, v, depuis) => {
            pose[c] = v; $$(`.etiq[data-c="${c}"]`, side).forEach(e => e.classList.toggle('pris', e.dataset.v === String(v)));
            if (depuis) await fly(depuis, caseDe(c), `<span class="etiq-vol${c === 'par' ? ' mot' : ''}">${v}</span>`, { scale: 1 });
            if (pose[c] === v) montrerCase(c, v);
          };
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(tapHere($('.etiq[data-v="5"]', side)), 5000); };
          if (!await avant(f, {
            question: 'Écoute encore le vendeur.', qui: 'vendeur', seg: OFFRE, sideW: 480, consigne: "Complète l'affiche" + NB + ': clique sur les bonnes étiquettes.',
            panneau: `<div class="panel glass"><p class="ptitre">L'affiche du forfait</p>${affiche()}</div>`,
            monte: p => {
              $$('.etiq', p).forEach(e => e.addEventListener('click', () => {
                if (document.body.dataset.turn !== 'you') return; A.unlock(); idle.reset(); sfx.tick();
                const c = e.dataset.c, v = c === 'go' ? +e.dataset.v : e.dataset.v; poser(c, v, e);
              }));
              $$('.case', p).forEach(b => b.addEventListener('click', () => {
                if (document.body.dataset.turn !== 'you' || pose[b.dataset.c] == null) return; A.unlock(); idle.reset(); sfx.tick();
                pose[b.dataset.c] = null; montrerCase(b.dataset.c, null);
              }));
            },
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); await playSegment(OFFRE[0], OFFRE[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (document.body.dataset.turn !== 'you') return;
            if (pose.go == null || pose.par == null) { Q.show('you', 'Complète les deux cases.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const goOk = pose.go === 20, parOk = pose.par === 'mois';
            if (goOk && parOk) {
              ['go', 'par'].forEach(c => caseDe(c).classList.add('juste'));
              if (!await juste(f, 'Oui' + NB + '! Vingt gigas pour dix euros par mois.', OFFRE)) return;
              suite();
              return;
            }
            const aff = $('#affiche', side); aff.classList.remove('shake'); void aff.offsetWidth; aff.classList.add('shake');
            if (!goOk) caseDe('go').classList.add('faux');
            if (!parOk) caseDe('par').classList.add('faux');
            const msg = !goOk ? (pose.go === 10 ? "Dix, c'est le prix. Écoute encore." : 'Pas ' + LIRE[pose.go] + ' gigas. Écoute encore.') : 'Pas par ' + pose.par + '. Écoute encore.';
            const montrer = await faux(f, OFFRE, msg); if (montrer === null) return;
            if (!goOk) { pose.go = null; montrerCase('go', null); }
            if (!parOk) { pose.par = null; montrerCase('par', null); }
            if (montrer) {
              await poser('go', 20); await poser('par', 'mois');
              ['go', 'par'].forEach(c => caseDe(c).classList.add('juste'));
              Q.show('ok', 'Vingt gigas pour dix euros par mois.'); state.essais = 0; suite();
            } else ask();
          }
          ask();
        },

        /* 3 · la carte du réseau : elle demande le Congo, il répond ; on allume les zones où elle peut appeler, puis Valider */
        async carte(f) {
          const choisi = new Set();
          const allumer = (id, on) => {
            if (on) choisi.add(id); else choisi.delete(id);
            $$(`[data-z="${id}"]`, side).forEach(el => { el.classList.toggle('on', on); el.classList.remove('faux', 'juste'); if (el.matches('.pastille')) el.setAttribute('aria-pressed', on); });
          };
          const marquer = (id, cls) => $$(`[data-z="${id}"]`, side).forEach(el => el.classList.add(cls));
          const ask = () => { Q.show('you', state.ask); goBtn('check', 'Valider', valider); yourTurn(); idle.set(tapHere($('.pastille[data-z="asie"]', side)), 5000); };
          if (!await avant(f, {
            question: 'Écoute bien.', seg: APPEL, sideW: 560, consigne: 'Avec ce forfait, elle peut appeler où' + NB + '? Clique sur les bonnes zones.',
            panneau: `<div class="panel glass"><p class="ptitre">Avec ce forfait, elle peut appeler…</p>${carte()}</div>`,
            monte: p => $$('.pays, .pastille', p).forEach(el => el.addEventListener('click', () => {
              if (document.body.dataset.turn !== 'you') return; A.unlock(); idle.reset(); sfx.tick();
              const id = el.dataset.z; allumer(id, !choisi.has(id));
            })),
          })) return;
          state.replay = async () => { setTurn('listen'); goBtn(null); await playSegment(APPEL[0], APPEL[1], gel()); if (alive(f)) ask(); };
          async function valider() {
            if (document.body.dataset.turn !== 'you') return;
            if (!choisi.size) { Q.show('you', 'Clique sur une zone de la carte.'); return; }
            setTurn('wait'); goBtn(null); idle.clear();
            const fausses = [...choisi].filter(id => !BONNES.includes(id));
            if (!fausses.length && BONNES.every(id => choisi.has(id))) {
              BONNES.forEach(id => marquer(id, 'juste'));
              if (!await juste(f, 'Oui' + NB + '! En France et en Europe.', phrase('seulement en France et en Europe'))) return;
              suite();
              return;
            }
            fausses.forEach(id => marquer(id, 'faux'));
            const pas = { congo: 'Pas le Congo.', afrique: "Pas l'Afrique.", amerique: "Pas l'Amérique.", asie: "Pas l'Asie." };
            const k = ['congo', 'afrique', 'amerique', 'asie'].find(id => choisi.has(id));
            const msg = k ? pas[k] + ' Écoute encore.' : !choisi.has('france') ? 'Et la France' + NB + '? Écoute encore.' : 'Pas seulement la France. Écoute encore.';
            const montrer = await faux(f, APPEL, msg); if (montrer === null) return;
            fausses.forEach(id => allumer(id, false));
            if (montrer) {
              BONNES.forEach(id => { allumer(id, true); marquer(id, 'juste'); });
              Q.show('ok', 'Seulement en France et en Europe.'); state.essais = 0; suite();
            } else ask();
          }
          ask();
        },
      };
    },
    bilan: A => ({
      faits: {
        vendeur: [{ text: '20 gigas pour 10' + A.NB + '€ par mois', seg: A.ligne(1) }, { text: 'seulement en France et en Europe', seg: A.phrase('seulement en France et en Europe') }],
        cliente: [{ text: 'un forfait pas cher', seg: A.phrase('un forfait pas cher') }, { text: 'Je peux appeler le Congo' + A.NB + '?', seg: A.ligne(2) }],
      },
    }),
  };
})();
