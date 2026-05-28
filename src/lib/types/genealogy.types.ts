export interface GenealogyNode {
  id: string;
  username: string;
  left?: GenealogyNode;
  right?: GenealogyNode;
}
